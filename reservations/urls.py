from django.conf.urls.i18n import i18n_patterns
from django.contrib import admin
from django.urls import path, include
from catalogue.views.home import home as catalogue_home
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
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
    path("api/token/", TokenObtainPairView.as_view()),
    path("api/token/refresh/", TokenRefreshView.as_view()),
    path("api/", api_root),
    path("api/rss/", UpcomingRepresentationsFeed()),
    # API endpoints stay language-agnostic
    path("api/", include("api.urls")),
]

urlpatterns += i18n_patterns(
    # Accueil du site (page racine /)
    path("", catalogue_home, name="home"),

    # Catalogue
    path("catalogue/", include(("catalogue.urls", "catalogue"), namespace="catalogue")),

    # Cart
    path("cart/", include(("cart.urls", "cart"), namespace="cart")),

    # Auth Django (login/logout/password_reset...)
    path("accounts/", include("django.contrib.auth.urls")),

    # Accounts app (profile, signup...)
    path("accounts/", include(("accounts.urls", "accounts"), namespace="accounts")),
)
