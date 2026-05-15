from django.db import models
from django.contrib.auth.models import User
from .locality import Locality

# create your modele here


class Artist(models.Model):
    firstname = models.CharField(max_length=60)
    lastname = models.CharField(max_length=60)
    producer = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='produced_artists',
    )
    photo = models.URLField(blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    locality = models.ForeignKey(Locality, on_delete=models.SET_NULL, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)

    def __str__(self):
        return self.firstname + " "+self.lastname

    class Meta:
        db_table = "artists"
