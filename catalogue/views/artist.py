from django.shortcuts import render, redirect, get_object_or_404
from django.http import Http404
from django.contrib.auth.decorators import login_required, user_passes_test

from catalogue.forms.ArtistForm import ArtistForm
from catalogue.models import Artist


def index(request):
    artists = Artist.objects.all()
    return render(request, "artist/index.html", {
        "artists": artists,
    })


def show(request, artist_id):
    artist = get_object_or_404(Artist, id=artist_id)
    return render(request, "artist/show.html", {
        "artist": artist,
    })


# ---- Permissions helpers ----
def is_staff_user(user):
    return user.is_authenticated and user.is_staff


@user_passes_test(is_staff_user)
def create(request):
    form = ArtistForm(request.POST or None)

    if request.method == "POST" and form.is_valid():
        form.save()
        return redirect("catalogue:artist-index")

    return render(request, "artist/create.html", {
        "form": form,
    })


@user_passes_test(is_staff_user)
def edit(request, artist_id):
    artist = get_object_or_404(Artist, id=artist_id)
    form = ArtistForm(request.POST or None, instance=artist)

    if request.method == "POST":
        method = request.POST.get("_method", "").upper()
        if method == "PUT" and form.is_valid():
            form.save()
            return redirect("catalogue:artist-show", artist_id=artist.id)

    return render(request, "artist/edit.html", {
        "form": form,
        "artist": artist,
    })


@user_passes_test(is_staff_user)
def delete(request, artist_id):
    """
    GET  -> page de confirmation
    POST -> si _method=DELETE (ou POST simple), supprime puis redirige
    """
    artist = get_object_or_404(Artist, id=artist_id)

    if request.method == "POST":
        method = request.POST.get("_method", "").upper()
        if method == "DELETE" or method == "":
            artist.delete()
            return redirect("catalogue:artist-index")

    return render(request, "artist/delete.html", {
        "artist": artist,
    })
