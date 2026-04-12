from django.test import TestCase, override_settings
from django.urls import reverse
from django.contrib.auth.models import User, Group
from catalogue.models import (
    Reservation, Representation, Show, Price, UserMeta
)
import datetime


def make_user(username='testuser', password='TestPass123!'):
    user = User.objects.create_user(username=username, password=password)
    UserMeta.objects.get_or_create(user=user, defaults={'langue': 'fr'})
    return user


def make_show():
    return Show.objects.create(
        slug='test-show',
        title='Test Show',
        created_in=2024,
    )


def make_representation(show, available_seats=10):
    return Representation.objects.create(
        show=show,
        schedule=datetime.datetime(2025, 6, 1, 20, 0, tzinfo=datetime.timezone.utc),
        available_seats=available_seats,
    )


def make_price():
    return Price.objects.create(
        type='Standard',
        price='20.00',
        description='Standard ticket',
        start_date=datetime.date(2025, 1, 1),
        end_date=datetime.date(2025, 12, 31),
    )


class ReservationTestCase(TestCase):
    def setUp(self):
        Group.objects.get_or_create(name='MEMBER')
        self.user = make_user()

    def test_reservation_creation(self):
        reservation = Reservation.objects.create(
            user=self.user,
            status='PENDING',
        )
        self.assertEqual(Reservation.objects.count(), 1)
        self.assertEqual(reservation.status, 'PENDING')

    def test_reservation_belongs_to_user(self):
        reservation = Reservation.objects.create(
            user=self.user,
            status='PENDING',
        )
        self.assertEqual(reservation.user, self.user)


class CartTestCase(TestCase):
    def setUp(self):
        Group.objects.get_or_create(name='MEMBER')
        self.user = make_user()
        self.show = make_show()
        self.representation = make_representation(self.show)
        self.price = make_price()

    def test_cart_add_adds_item_to_session(self):
        self.client.login(username='testuser', password='TestPass123!')
        response = self.client.post(
            reverse('cart:cart_add', args=[self.representation.id]),
            {
                'price_id': self.price.id,
                'quantity': 1,
            }
        )
        self.assertEqual(response.status_code, 302)
        session = self.client.session
        self.assertIn('cart', session)
        key = f"{self.representation.id}_{self.price.id}"
        self.assertIn(key, session['cart'])
        self.assertEqual(session['cart'][key]['quantity'], 1)

    def test_cart_update_quantity(self):
        self.client.login(username='testuser', password='TestPass123!')
        # Add initial
        self.client.post(reverse('cart:cart_add', args=[self.representation.id]), {
            'price_id': self.price.id,
            'quantity': 1,
        })
        # Update with override
        response = self.client.post(reverse('cart:cart_add', args=[self.representation.id]), {
            'price_id': self.price.id,
            'quantity': 5,
            'override_quantity': 'true'
        })
        self.assertEqual(response.status_code, 302)
        session = self.client.session
        key = f"{self.representation.id}_{self.price.id}"
        self.assertEqual(session['cart'][key]['quantity'], 5)

    def test_cart_remove_item(self):
        self.client.login(username='testuser', password='TestPass123!')
        self.client.post(reverse('cart:cart_add', args=[self.representation.id]), {
            'price_id': self.price.id,
            'quantity': 1,
        })
        response = self.client.get(reverse('cart:cart_remove', args=[self.representation.id, self.price.id]))
        self.assertEqual(response.status_code, 302)
        session = self.client.session
        self.assertEqual(len(session['cart']), 0)

    def test_cart_total_price(self):
        self.client.login(username='testuser', password='TestPass123!')
        self.client.post(reverse('cart:cart_add', args=[self.representation.id]), {
            'price_id': self.price.id,
            'quantity': 2,
        })
        response = self.client.get(reverse('cart:cart_detail'))
        self.assertEqual(response.status_code, 200)
        # Debug: print(response.content.decode())
        # The decimal separator might be a comma due to the 'fr' locale
        content = response.content.decode()
        self.assertTrue('40' in content)
        self.assertTrue('€' in content)

    def test_cart_navbar_count(self):
        self.client.login(username='testuser', password='TestPass123!')
        # Initially empty or not shown
        response = self.client.get(reverse('home'))
        self.assertNotContains(response, 'badge rounded-pill bg-danger')
        
        # Add 3 items
        self.client.post(reverse('cart:cart_add', args=[self.representation.id]), {
            'price_id': self.price.id,
            'quantity': 3,
        })
        response = self.client.get(reverse('home'))
        # Should show '3' in the badge
        self.assertContains(response, '3')
        self.assertContains(response, 'badge rounded-pill bg-danger')

    @override_settings(LOGIN_URL='/accounts/login/')
    def test_cart_checkout_requires_login(self):
        response = self.client.post(reverse('cart:cart_checkout'))
        self.assertEqual(response.status_code, 302)
        self.assertIn('/accounts/login', response['Location'])
