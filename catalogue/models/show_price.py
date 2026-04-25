from django.db import models
from .show import Show


class ShowPrice(models.Model):
    show = models.ForeignKey(Show, on_delete=models.CASCADE, related_name='prices')
    category = models.CharField(max_length=100)
    amount = models.DecimalField(decimal_places=2, max_digits=10)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.category} : {self.amount} € ({self.show.title})"

    class Meta:
        db_table = "show_prices"
        ordering = ['amount']