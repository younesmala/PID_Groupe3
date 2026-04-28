from django.db import migrations
from django.utils.text import slugify


def populate_slugs(apps, schema_editor):
    Show = apps.get_model('catalogue', 'Show')
    for show in Show.objects.filter(slug=''):
        base = slugify(show.title) or f'show-{show.pk}'
        slug = base[:60]
        n = 1
        while Show.objects.filter(slug=slug).exclude(pk=show.pk).exists():
            suffix = f'-{n}'
            slug = base[:60 - len(suffix)] + suffix
            n += 1
        show.slug = slug
        show.save(update_fields=['slug'])


class Migration(migrations.Migration):

    dependencies = [
        ('catalogue', '0027_alter_show_slug_autoslugfield'),
    ]

    operations = [
        migrations.RunPython(populate_slugs, migrations.RunPython.noop),
    ]