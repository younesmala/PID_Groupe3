import secrets
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserProfile(models.Model):
    ROLES = [
        ('USER', 'Utilisateur'),
        ('PRODUCER', 'Producteur'),
        ('ADMIN', 'Admin'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLES, default='USER')

    def __str__(self):
        return f"{self.user.username} - {self.role}"

    class Meta:
        db_table = 'user_profiles'


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.get_or_create(user=instance)


class AffiliateProfile(models.Model):
    PLANS = [
        ('free', 'Free'),
        ('starter', 'Starter'),
        ('premium', 'Premium'),
    ]
    user = models.OneToOneField(
        User, on_delete=models.CASCADE,
        related_name='affiliate_profile'
    )
    plan = models.CharField(
        max_length=20, choices=PLANS, default='free'
    )
    api_key = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} – {self.plan}"

    class Meta:
        db_table = 'affiliate_profiles'
