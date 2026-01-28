from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView

urlpatterns = [
    path("admin/", admin.site.urls),

    # Accueil du SITE (page racine /)
    path("", TemplateView.as_view(template_name="home.html"), name="home"),

    # Catalogue (toutes les routes sous /catalogue/)
    path("catalogue/", include(("catalogue.urls", "catalogue"), namespace="catalogue")),

    # Auth (login/logout/password_reset...) sous /accounts/ (avec namespace accounts)
    path("accounts/", include(("django.contrib.auth.urls", "accounts"), namespace="accounts")),
]
