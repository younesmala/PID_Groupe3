from django.conf.urls.i18n import i18n_patterns
from django.urls import path, include

from catalogue.views.home import home as catalogue_home

urlpatterns = [
    path("i18n/", include("django.conf.urls.i18n")),
]

urlpatterns += i18n_patterns(
    path("", catalogue_home, name="home"),
    path("catalogue/", include("catalogue.urls")),
    path("accounts/", include("django.contrib.auth.urls")),
    path("accounts/", include("accounts.urls")),
    path("cart/", include("cart.urls")),
    path("api/", include("api.urls")),
)
