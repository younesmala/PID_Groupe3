from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView

urlpatterns = [
    path('i18n/', include('django.conf.urls.i18n')),
    path("admin/", admin.site.urls),

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

    # Cart
    path('cart/', include('cart.urls', namespace='cart')),
]
