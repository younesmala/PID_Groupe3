from django.test import TestCase, override_settings
from django.urls import reverse
from django.contrib.auth.models import User, Group
from catalogue.models import UserMeta


class SignupTestCase(TestCase):
    def setUp(self):
        Group.objects.get_or_create(name='MEMBER')

    def test_signup_creates_user_and_assigns_member_group(self):
        response = self.client.post(reverse('accounts:user-signup'), {
            'username': 'testuser',
            'first_name': 'Test',
            'last_name': 'User',
            'email': 'test@example.com',
            'password1': 'StrongPass123!',
            'password2': 'StrongPass123!',
            'langue': 'fr',
        })
        self.assertEqual(User.objects.filter(username='testuser').count(), 1)
        user = User.objects.get(username='testuser')
        self.assertIn('MEMBER', user.groups.values_list('name', flat=True))

    def test_signup_redirects_on_success(self):
        response = self.client.post(reverse('accounts:user-signup'), {
            'username': 'newuser',
            'first_name': 'New',
            'last_name': 'User',
            'email': 'new@example.com',
            'password1': 'StrongPass123!',
            'password2': 'StrongPass123!',
            'langue': 'fr',
        })
        self.assertEqual(response.status_code, 302)


class LoginTestCase(TestCase):
    def setUp(self):
        Group.objects.get_or_create(name='MEMBER')
        self.user = User.objects.create_user(
            username='loginuser',
            password='TestPass123!',
        )
        UserMeta.objects.get_or_create(
            user=self.user, defaults={'langue': 'fr'})

    def test_login_with_valid_credentials(self):
        response = self.client.post('/accounts/login/', {
            'username': 'loginuser',
            'password': 'TestPass123!',
        })
        # Successful login redirects
        self.assertEqual(response.status_code, 302)

    def test_login_with_wrong_password(self):
        response = self.client.post('/accounts/login/', {
            'username': 'loginuser',
            'password': 'wrongpassword',
        })
        # Failed login re-renders the login form and returns 200
        self.assertEqual(response.status_code, 200)

    @override_settings(LOGIN_URL='/accounts/login/')
    def test_profile_requires_login(self):
        response = self.client.get(reverse('accounts:user-profile'))
        self.assertEqual(response.status_code, 302)
        self.assertIn('/accounts/login', response['Location'])
