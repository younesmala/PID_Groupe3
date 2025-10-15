from django.db import models
from django.utils.text import slugify

class Location(models.Model):
    designation = models.CharField(max_length=255)

    def __str__(self):
        return self.designation


class Show(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True)
    price = models.FloatField(default=0)
    bookable = models.BooleanField(default=True)
    location = models.ForeignKey(Location, on_delete=models.CASCADE, null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Representation(models.Model):
    show = models.ForeignKey(Show, related_name='representations', on_delete=models.CASCADE)
    start_at = models.DateTimeField()

    def __str__(self):
        return f"{self.show.title} - {self.start_at.strftime('%d/%m/%Y %H:%M')}"
