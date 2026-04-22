import secrets
from django.db import models
from django.contrib.auth.models import User


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
