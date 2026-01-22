from django.urls import path
from catalogue.views.home import home
from catalogue.views import artist

app_name = "catalogue"

urlpatterns = [
    path("", home, name="home"),
    path("artist/", artist.index, name="artist-index"),
    path("artist/<int:artist_id>/", artist.show, name="artist-show"),
    path("artist/edit/<int:artist_id>/", artist.edit, name="artist-edit"),
    path("artist/create/", artist.create, name="artist-create"),
    path("artist/delete/<int:artist_id>/", artist.delete, name="artist-delete"),
]
