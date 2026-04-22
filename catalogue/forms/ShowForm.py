from django.forms import ModelForm
from django.utils.translation import gettext_lazy as _
from catalogue.models import Show


class ShowForm(ModelForm):
    class Meta:
        model = Show
        fields = [
            'slug',
            'title',
            'description',
            'poster_url',
            'duration',
            'created_in',
            'artist',
            'location',
            'bookable',
            'publication_status',
        ]
        labels = {
            'slug': _('Slug'),
            'title': _('Titre'),
            'description': _('Description'),
            'poster_url': _("URL de l'affiche"),
            'duration': _('Duree'),
            'created_in': _('Cree en'),
            'artist': _('Artiste'),
            'location': _('Lieu'),
            'bookable': _('Reservable'),
            'publication_status': _('Statut de publication'),
        }
