from django.contrib import admin
from django.urls import path
from catalog import views as cviews

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', cviews.ShowListView.as_view(), name='show_list'),  # page d'accueil
    path('show/<slug:slug>/', cviews.ShowDetailView.as_view(), name='show_detail'),
]
