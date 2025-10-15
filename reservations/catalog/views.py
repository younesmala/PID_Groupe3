
from django.views.generic import ListView, DetailView
from .models import Show

# Liste de tous les spectacles
class ShowListView(ListView):
    model = Show
    ordering = 'title'
    template_name = 'catalog/show_list.html'

# Détail d’un spectacle précis
class ShowDetailView(DetailView):
    model = Show
    slug_field = 'slug'
    template_name = 'catalog/show_detail.html'
