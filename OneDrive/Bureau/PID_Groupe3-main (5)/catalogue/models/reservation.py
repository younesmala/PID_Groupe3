from django.db import models
from django.contrib.auth.models import User
from .representation import Representation


class Reservation(models.Model):
    booking_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=60)
    user = models.ForeignKey(User, on_delete=models.RESTRICT,
                             null=False, related_name='reservations')
    representation = models.ForeignKey(Representation, on_delete=models.RESTRICT,
                                       null=False, related_name='reservations')
    quantity = models.PositiveIntegerField(default=1)
    payment_status = models.CharField(max_length=20, default='pending', choices=[
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded')
    ])

    def __str__(self):
        return f"{self.user} - {self.representation} - {self.booking_date}"

    class Meta:
        db_table = "reservations"


class RepresentationReservation(models.Model):
    reservation = models.ForeignKey(
        Reservation,
        on_delete=models.CASCADE,
        related_name='representation_reservations'
    )
    representation = models.ForeignKey(
        'Representation',
        on_delete=models.RESTRICT,
        related_name='representation_reservations'
    )
    price = models.ForeignKey(
        'Price',
        on_delete=models.RESTRICT
    )
    quantity = models.IntegerField(default=1)

    @property
    def subtotal(self):
        return self.price.price * self.quantity

    class Meta:
        db_table = "representation_reservations"
