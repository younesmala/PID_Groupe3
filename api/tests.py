from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from catalogue.models import Artist, Show, Representation


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
        url = reverse("api:representations-detail", args=[self.representation.id])
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
        url = reverse("api:representations-detail", args=[self.representation.id])
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
        url = reverse("api:representations-detail", args=[self.representation.id])
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
        url = reverse("api:representations-availability", args=[self.representation.id])
        response = self.client.get(url, {"show": self.show.id})

        self.assertEqual(response.status_code, status.HTTP_200_OK)