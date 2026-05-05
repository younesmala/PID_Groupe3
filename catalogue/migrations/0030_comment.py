import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalogue', '0029_review_status_show_producer'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Comment',
            fields=[
                (
                    'id',
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name='ID',
                    ),
                ),
                ('content', models.TextField()),
                (
                    'status',
                    models.CharField(
                        choices=[
                            ('pending', 'Pending'),
                            ('approved', 'Approved'),
                            ('rejected', 'Rejected'),
                        ],
                        default='pending',
                        max_length=10,
                    ),
                ),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                (
                    'show',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='comments',
                        to='catalogue.show',
                    ),
                ),
                (
                    'user',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='comments',
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                'db_table': 'comments',
            },
        ),
    ]