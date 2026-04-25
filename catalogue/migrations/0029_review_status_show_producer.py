import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalogue', '0028_populate_show_slugs'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='review',
            name='status',
            field=models.CharField(
                choices=[
                    ('pending', 'Pending'),
                    ('approved', 'Approved'),
                    ('rejected', 'Rejected'),
                ],
                default='pending',
                max_length=10,
            ),
        ),
        migrations.AlterField(
            model_name='review',
            name='validated',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='show',
            name='producer',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='produced_shows',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]