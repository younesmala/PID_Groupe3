from django.db import models
from .show import *
from django.contrib.auth.models import User


class ReviewManager(models.Manager):
    def get_by_natural_key(self, user_id, show_slug, show_created_in):
        return self.get(user_id=user_id,
                        show_id=Show.objects.get_by_natural_key(show_slug, show_created_in).pk)


class Review(models.Model):
    STATUS_PENDING = 'pending'
    STATUS_APPROVED = 'approved'
    STATUS_REJECTED = 'rejected'
    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_APPROVED, 'Approved'),
        (STATUS_REJECTED, 'Rejected'),
    ]

    user = models.ForeignKey(User, on_delete=models.RESTRICT,
                             null=False, related_name='user')
    show = models.ForeignKey(Show, on_delete=models.RESTRICT,
                             null=False, related_name='show')
    review = models.TextField()
    stars = models.PositiveSmallIntegerField()
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING,
    )
    validated = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(null=True)

    def __str__(self):
        return f"{self.user.username} - {self.show.title} : {self.stars}"

    class Meta:
        db_table = "reviews"

    def natural_key(self):
        return (self.user_id, self.show.slug, self.show.created_in)
