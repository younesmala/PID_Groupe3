from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from catalogue.models import Artist, Show, Representation, Price, Reservation, RepresentationReservation, ShowPrice
from api.models import UserProfile


class ArtistsApiTests(APITestCase):
    def setUp(self):
        self.artist = Artist.objects.create(
            firstname="Jean",
            lastname="Dupont",
        )

    def test_get_artists_list_returns_200(self):
        url = reverse("api:artists-list-create")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 1)

    def test_post_artist_valid_data_returns_201(self):
        url = reverse("api:artists-list-create")
        data = {
            "firstname": "Marie",
            "lastname": "Ngono",
        }

        response = self.client.post(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Artist.objects.count(), 2)
        self.assertEqual(response.data["firstname"], "Marie")
        self.assertEqual(response.data["lastname"], "Ngono")

    def test_post_artist_invalid_data_returns_400(self):
        url = reverse("api:artists-list-create")
        data = {
            "firstname": "",
            "lastname": "",
        }

        response = self.client.post(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_artist_detail_returns_200(self):
        url = reverse("api:artists-detail", args=[self.artist.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["firstname"], "Jean")
        self.assertEqual(response.data["lastname"], "Dupont")

    def test_get_artist_detail_unknown_id_returns_404(self):
        url = reverse("api:artists-detail", args=[9999])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["detail"], "Not found")

    def test_put_artist_valid_data_returns_200(self):
        url = reverse("api:artists-detail", args=[self.artist.id])
        data = {
            "firstname": "Paul",
            "lastname": "Biya",
        }

        response = self.client.put(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.artist.refresh_from_db()
        self.assertEqual(self.artist.firstname, "Paul")
        self.assertEqual(self.artist.lastname, "Biya")

    def test_put_artist_invalid_data_returns_400(self):
        url = reverse("api:artists-detail", args=[self.artist.id])
        data = {
            "firstname": "",
            "lastname": "",
        }

        response = self.client.put(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_put_artist_unknown_id_returns_404(self):
        url = reverse("api:artists-detail", args=[9999])
        data = {
            "firstname": "Paul",
            "lastname": "Biya",
        }

        response = self.client.put(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["detail"], "Not found")

    def test_delete_artist_returns_204(self):
        url = reverse("api:artists-detail", args=[self.artist.id])
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Artist.objects.count(), 0)

    def test_delete_artist_unknown_id_returns_404(self):
        url = reverse("api:artists-detail", args=[9999])
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["detail"], "Not found")

    def test_authenticated_producer_sees_only_own_artists_and_create_assigns_owner(self):
        producer_one = User.objects.create_user(
            username="producer-one",
            email="producer-one@example.com",
            password="testpass123",
        )
        producer_two = User.objects.create_user(
            username="producer-two",
            email="producer-two@example.com",
            password="testpass123",
        )

        profile_one, _ = UserProfile.objects.get_or_create(user=producer_one)
        profile_one.role = "PRODUCER"
        profile_one.save(update_fields=["role"])

        profile_two, _ = UserProfile.objects.get_or_create(user=producer_two)
        profile_two.role = "PRODUCER"
        profile_two.save(update_fields=["role"])

        artist_one = Artist.objects.create(firstname="Alice", lastname="Owner", producer=producer_one)
        Artist.objects.create(firstname="Bob", lastname="Other", producer=producer_two)

        self.client.force_authenticate(user=producer_one)

        list_url = reverse("api:artists-list-create")
        list_response = self.client.get(list_url)
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)
        self.assertEqual(list_response.data[0]["id"], artist_one.id)

        create_response = self.client.post(
            list_url,
            {"firstname": "Charlie", "lastname": "New"},
            format="json",
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        created_artist = Artist.objects.get(id=create_response.data["id"])
        self.assertEqual(created_artist.producer_id, producer_one.id)


class AdminUsersApiTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin",
            email="admin@example.com",
            password="adminpass",
            is_staff=True,
        )
        self.user = User.objects.create_user(
            username="visitor",
            email="visitor@example.com",
            password="visitorpass",
        )
        UserProfile.objects.get_or_create(user=self.user)
        self.client.force_authenticate(user=self.admin)

    def test_get_admin_users_returns_200(self):
        url = reverse("api:admin-users")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_patch_admin_user_status_toggles_is_active(self):
        self.assertTrue(self.user.is_active)

        url = reverse("api:admin-users-status", args=[self.user.id])
        response = self.client.patch(url, {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertFalse(self.user.is_active)
        self.assertFalse(response.data["is_active"])

    def test_patch_admin_user_status_rejects_admin_target(self):
        url = reverse("api:admin-users-status", args=[self.admin.id])
        response = self.client.patch(url, {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.admin.refresh_from_db()
        self.assertTrue(self.admin.is_active)
        self.assertEqual(response.data["detail"], "Admin users cannot be deactivated.")


class AdminStatsApiTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin-stats",
            email="admin-stats@example.com",
            password="adminpass",
            is_staff=True,
        )
        self.client.force_authenticate(user=self.admin)

    def test_get_admin_stats_includes_pending_shows_count(self):
        Show.objects.create(
            slug="pending-show",
            title="Pending Show",
            created_in=2026,
            publication_status=Show.PublicationStatus.PENDING,
        )
        Show.objects.create(
            slug="approved-show",
            title="Approved Show",
            created_in=2026,
            publication_status=Show.PublicationStatus.APPROVED,
        )

        url = reverse("api:admin-stats")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_shows"], 2)
        self.assertEqual(response.data["pending_shows"], 1)


class ShowsApiTests(APITestCase):
    def setUp(self):
        self.show = Show.objects.create(
            slug="ayiti",
            title="Ayiti",
            created_in=2024,
        )

    def test_get_shows_list_returns_200(self):
        url = reverse("api:shows-list-create")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)

    def test_get_show_detail_returns_200(self):
        url = reverse("api:shows-detail", args=[self.show.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["slug"], "ayiti")
        self.assertEqual(response.data["title"], "Ayiti")

    def test_get_show_detail_unknown_id_returns_404(self):
        url = reverse("api:shows-detail", args=[9999])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["detail"], "Spectacle non trouvé")

    def test_search_shows_without_query_returns_200(self):
        url = reverse("api:shows-search")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_search_shows_with_query_returns_matching_results(self):
        Show.objects.create(
            slug="hamlet",
            title="Hamlet",
            created_in=2025,
        )

        url = reverse("api:shows-search")
        response = self.client.get(url, {"q": "Hamlet"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], "Hamlet")

    def test_post_show_valid_data_returns_201(self):
        url = reverse("api:shows-list-create")
        data = {
            "slug": "hamlet",
            "title": "Hamlet",
            "created_in": 2025,
        }

        response = self.client.post(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Show.objects.count(), 2)
        self.assertEqual(response.data["title"], "Hamlet")

    def test_post_show_invalid_data_returns_400(self):
        url = reverse("api:shows-list-create")
        data = {
            "slug": "",
            "title": "",
        }

        response = self.client.post(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_put_show_valid_data_returns_200(self):
        url = reverse("api:shows-detail", args=[self.show.id])
        data = {
            "title": "Ayiti Updated",
        }

        response = self.client.put(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.show.refresh_from_db()
        self.assertEqual(self.show.title, "Ayiti Updated")

    def test_put_show_unknown_id_returns_404(self):
        url = reverse("api:shows-detail", args=[9999])
        data = {
            "title": "Unknown Show",
        }

        response = self.client.put(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["detail"], "Spectacle non trouvé")

    def test_delete_show_returns_204(self):
        url = reverse("api:shows-detail", args=[self.show.id])
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Show.objects.count(), 0)

    def test_delete_show_unknown_id_returns_404(self):
        url = reverse("api:shows-detail", args=[9999])
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["detail"], "Spectacle non trouvé")


class AdminReservationsApiTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin_resa",
            email="admin_resa@example.com",
            password="adminpass",
            is_staff=True,
        )
        self.user = User.objects.create_user(
            username="buyer",
            email="buyer@example.com",
            password="buyerpass",
        )
        UserProfile.objects.get_or_create(user=self.user)
        self.show = Show.objects.create(
            slug="reservation-show",
            title="Reservation Show",
            created_in=2026,
        )
        self.representation = Representation.objects.create(
            show=self.show,
            schedule="2026-06-01T20:00:00Z",
            available_seats=10,
        )
        self.price = Price.objects.create(
            type="adult",
            price="15.00",
            description="Adult ticket",
            start_date="2026-01-01",
            end_date="2026-12-31",
        )

    def test_admin_reservations_returns_stored_total_paid(self):
        reservation = Reservation.objects.create(
            user=self.user,
            representation=self.representation,
            quantity=2,
            status="confirmed",
            payment_status="paid",
            total_paid="30.00",
        )

        self.client.force_authenticate(user=self.admin)
        response = self.client.get(reverse("api:admin-reservations"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payload = next(item for item in response.data if item["id"] == reservation.id)
        self.assertEqual(payload["total_paid"], "30.00")

    def test_admin_reservations_falls_back_to_reservation_lines(self):
        reservation = Reservation.objects.create(
            user=self.user,
            representation=self.representation,
            quantity=3,
            status="confirmed",
            payment_status="paid",
            total_paid="0.00",
        )
        RepresentationReservation.objects.create(
            reservation=reservation,
            representation=self.representation,
            price=self.price,
            quantity=3,
        )

        self.client.force_authenticate(user=self.admin)
        response = self.client.get(reverse("api:admin-reservations"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payload = next(item for item in response.data if item["id"] == reservation.id)
        self.assertEqual(payload["total_paid"], "45.00")

    def test_admin_reservations_returns_computed_total_for_pending_payment(self):
        reservation = Reservation.objects.create(
            user=self.user,
            representation=self.representation,
            quantity=2,
            status="pending",
            payment_status="pending",
            total_paid="0.00",
        )
        RepresentationReservation.objects.create(
            reservation=reservation,
            representation=self.representation,
            price=self.price,
            quantity=2,
        )

        self.client.force_authenticate(user=self.admin)
        response = self.client.get(reverse("api:admin-reservations"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payload = next(item for item in response.data if item["id"] == reservation.id)
        self.assertEqual(payload["total_paid"], "30.00")

    def test_admin_reservations_falls_back_to_show_price_when_lines_missing(self):
        ShowPrice.objects.create(show=self.show, category="Base", amount="5.00")
        reservation = Reservation.objects.create(
            user=self.user,
            representation=self.representation,
            quantity=3,
            status="pending",
            payment_status="pending",
            total_paid="0.00",
        )

        self.client.force_authenticate(user=self.admin)
        response = self.client.get(reverse("api:admin-reservations"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payload = next(item for item in response.data if item["id"] == reservation.id)
        self.assertEqual(payload["total_paid"], "15.00")


class CheckoutApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="checkout_user",
            email="checkout@example.com",
            password="checkoutpass",
        )
        UserProfile.objects.get_or_create(user=self.user)
        self.show = Show.objects.create(
            slug="checkout-show",
            title="Checkout Show",
            created_in=2026,
        )
        self.representation = Representation.objects.create(
            show=self.show,
            schedule="2026-07-01T20:00:00Z",
            available_seats=8,
        )
        self.price = Price.objects.create(
            type="student",
            price="8.50",
            description="Student ticket",
            start_date="2026-01-01",
            end_date="2026-12-31",
        )

    def test_checkout_persists_total_paid_and_reservation_line(self):
        session = self.client.session
        session['cart'] = {
            f"{self.representation.id}_{self.price.id}": {
                'representation_id': self.representation.id,
                'price_id': self.price.id,
                'quantity': 2,
            }
        }
        session.save()

        self.client.force_authenticate(user=self.user)
        response = self.client.post(reverse("api:checkout"), {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        reservation = Reservation.objects.get(id=response.data['reservation_ids'][0])
        self.assertEqual(str(reservation.total_paid), "17.00")
        self.assertTrue(
            RepresentationReservation.objects.filter(
                reservation=reservation,
                representation=self.representation,
                price=self.price,
                quantity=2,
            ).exists()
        )
        self.representation.refresh_from_db()
        self.assertEqual(self.representation.available_seats, 6)


class RepresentationsApiTests(APITestCase):
    def setUp(self):
        self.show = Show.objects.create(
            slug="ayiti",
            title="Ayiti",
            created_in=2024,
        )

        self.representation = Representation.objects.create(
            show=self.show,
            schedule="2026-05-01T20:00:00Z",
            location=None,
        )

    def test_get_representations_list_returns_200(self):
        url = reverse("api:representations-list-create")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 1)

    def test_get_representations_filtered_by_show_returns_200(self):
        url = reverse("api:representations-list-create")
        response = self.client.get(url, {"show": self.show.id})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_get_representation_detail_returns_200(self):
        url = reverse("api:representations-detail",
                      args=[self.representation.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["show"], self.show.id)

    def test_get_representation_detail_unknown_id_returns_404(self):
        url = reverse("api:representations-detail", args=[9999])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["detail"], "Représentation non trouvée")

    def test_post_representation_valid_data_returns_201(self):
        url = reverse("api:representations-list-create")
        data = {
            "show": self.show.id,
            "schedule": "2026-06-01T20:00:00Z",
            "location": None,
        }

        response = self.client.post(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Representation.objects.count(), 2)

    def test_post_representation_invalid_data_returns_400(self):
        url = reverse("api:representations-list-create")
        data = {}

        response = self.client.post(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_put_representation_valid_data_returns_200(self):
        url = reverse("api:representations-detail",
                      args=[self.representation.id])
        data = {
            "schedule": "2026-07-01T21:00:00Z",
        }

        response = self.client.put(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.representation.refresh_from_db()
        self.assertEqual(self.representation.schedule.year, 2026)
        self.assertEqual(self.representation.schedule.month, 7)
        self.assertEqual(self.representation.schedule.day, 1)
        self.assertEqual(self.representation.schedule.hour, 21)

    def test_put_representation_unknown_id_returns_404(self):
        url = reverse("api:representations-detail", args=[9999])
        data = {
            "schedule": "2026-07-01T21:00:00Z",
        }

        response = self.client.put(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["detail"], "Représentation non trouvée")

    def test_delete_representation_returns_204(self):
        url = reverse("api:representations-detail",
                      args=[self.representation.id])
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Representation.objects.count(), 0)

    def test_delete_representation_unknown_id_returns_404(self):
        url = reverse("api:representations-detail", args=[9999])
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["detail"], "Représentation non trouvée")

    def test_get_representations_calendar_returns_200(self):
        url = reverse("api:representations-calendar")
        response = self.client.get(url, {
            "start": "2026-05-01",
            "end": "2026-05-31",
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_representations_availability_returns_200(self):
        url = reverse("api:representations-availability",
                      args=[self.representation.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
