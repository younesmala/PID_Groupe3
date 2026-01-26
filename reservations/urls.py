from django.views.generic import RedirectView
from django.contrib import admin
from django.urls import include, path
from catalogue.views import home


urlpatterns = [

    path('catalogue/', include('catalogue.urls')),
    path('api/', include('api.urls')),
    path('admin/', admin.site.urls),
    path('', home, name='home'), 
]
