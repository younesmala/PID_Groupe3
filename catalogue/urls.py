from django.urls import path
from .views.home import home
from .views.artist import index, create, show, edit, delete
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

    # Admin dashboard
    path("admin-dashboard/", AdminDashboardView.as_view(), name="admin-dashboard"),
    path("admin-dashboard/users/", AdminUsersView.as_view(), name="admin-users"),
    path("admin-dashboard/users/<int:pk>/edit/", AdminUserEditView.as_view(), name="admin-user-edit"),
]
