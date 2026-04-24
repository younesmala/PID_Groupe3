from django.conf.urls.i18n import i18n_patterns
from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from catalogue.views.home import home as catalogue_home
from rest_framework.decorators import api_view
from rest_framework.response import Response
from api.views.rss import UpcomingRepresentationsFeed


@api_view(['GET'])
def api_root(request):
    return Response({
        "message": "PIDBooking API",
        "version": "1.0",
        "endpoints": {
            "shows": "/api/shows/",
            "cart": "/api/cart/",
            "auth_login": "/api/auth/login/",
            "auth_logout": "/api/auth/logout/",
        }
    })


urlpatterns = [
    path("admin/", admin.site.urls),
    path("i18n/", include("django.conf.urls.i18n")),
    path("api/", api_root),
    path("api/rss/", UpcomingRepresentationsFeed()),

    # Accueil du SITE (page racine /)
    path("", TemplateView.as_view(template_name="catalogue/home.html"), name="home"),
    path("api/", include("api.urls")),

    # Catalogue
    path("catalogue/", include(("catalogue.urls", "catalogue"), namespace="catalogue")),

    # Cart
    path("cart/", include(("cart.urls", "cart"), namespace="cart")),

    # Auth Django (login/logout/password_reset...) SANS namespace
    path("accounts/", include("django.contrib.auth.urls")),

    # Accounts app (profile, signup...)
    path("accounts/", include("accounts.urls", namespace="accounts")),
]

urlpatterns += i18n_patterns(
    path("", catalogue_home, name="home"),
    path("catalogue/", include("catalogue.urls")),
    path("accounts/", include("django.contrib.auth.urls")),
    path("accounts/", include("accounts.urls")),
    path("cart/", include("cart.urls")),
    path("api/", include("api.urls")),
)
