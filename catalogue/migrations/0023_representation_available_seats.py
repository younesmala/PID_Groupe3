from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ("catalogue", "0022_reservation_quantity_reservation_representation"),
    ]
    operations = [
        migrations.AddField(
            model_name="representation",
            name="available_seats",
            field=models.IntegerField(default=100),
        ),
    ]
