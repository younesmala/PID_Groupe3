from django.forms import ModelForm
from django.utils.translation import gettext_lazy as _
from catalogue.models import Show


class ShowForm(ModelForm):
    class Meta:
        model = Show
        fields = ['slug', 'title', 'description', 'poster_url',
                  'duration', 'created_in', 'location', 'bookable']
        labels = {
            'slug': _('Slug'),
            'title': _('Titre'),
            'description': _('Description'),
            'poster_url': _("URL de l'affiche"),
            'duration': _('Durée'),
            'created_in': _('Créé en'),
            'location': _('Lieu'),
            'bookable': _('Réservable'),
        }
