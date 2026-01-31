from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView

urlpatterns = [
    path("admin/", admin.site.urls),

    # Accueil du SITE (page racine /)
    path("", TemplateView.as_view(template_name="home.html"), name="home"),
    path("api/", include("api.urls")),


    # Catalogue
    path("catalogue/", include(("catalogue.urls", "catalogue"), namespace="catalogue")),

    # Auth Django (login/logout/password_reset...) SANS namespace
    path("accounts/", include("django.contrib.auth.urls")),
]
