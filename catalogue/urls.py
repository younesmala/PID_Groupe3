"""reservations.catalogue URL Configuration
"""
from django.urls import path
from . import views

app_name='catalogue'

urlpatterns = [
    path('artist/', views.index, name='artist-index'),


    # Fiche d'un artiste (détail)
    path('artist/<int:artist_id>/', views.show, name='artist-show'),

    # Formulaire de modification
    path('artist/edit/<int:artist_id>/', views.edit, name='artist-edit'),

    # Formulaire de création
    path('artist/create/', views.create, name='artist-create'),

    # Suppression
    path('artist/delete/<int:artist_id>/', views.delete, name='artist-delete'),
]
