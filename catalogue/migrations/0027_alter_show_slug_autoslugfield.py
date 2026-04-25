import autoslug.fields
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('catalogue', '0026_show_artist_show_publication_status_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='show',
            name='slug',
            field=autoslug.fields.AutoSlugField(
                editable=False,
                max_length=60,
                populate_from='title',
                unique=True,
            ),
        ),
    ]