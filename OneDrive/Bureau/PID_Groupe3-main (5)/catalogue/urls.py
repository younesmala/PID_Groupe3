from django.urls import path
from .views.home import home
from .views.artist import index, create, show, edit, delete
from .views import show_ as show_views
from .views.admin_dashboard import AdminDashboardView, AdminUsersView, AdminUserEditView

app_name = "catalogue"

urlpatterns = [
    # Accueil DU CATALOGUE: /catalogue/
    path("", home, name="home"),

    # Artistes: /catalogue/artist/...
    path("artist/", index, name="artist-index"),
    path("artist/create/", create, name="artist-create"),
    path("artist/<int:artist_id>/", show, name="artist-show"),
    path("artist/<int:artist_id>/edit/", edit, name="artist-edit"),
    path("artist/<int:artist_id>/delete/", delete, name="artist-delete"),

    # Spectacles: /catalogue/show/...
    path("show/", show_views.index, name="show-index"),
    path("show/create/", show_views.create, name="show-create"),
    path("show/<int:show_id>/", show_views.show, name="show-show"),
    path("show/<int:show_id>/edit/", show_views.edit, name="show-edit"),
    path("show/<int:show_id>/delete/", show_views.delete, name="show-delete"),

    # Admin dashboard
    path("admin-dashboard/", AdminDashboardView.as_view(), name="admin-dashboard"),
    path("admin-dashboard/users/", AdminUsersView.as_view(), name="admin-users"),
    path("admin-dashboard/users/<int:pk>/edit/", AdminUserEditView.as_view(), name="admin-user-edit"),
]
