from django.shortcuts import render, redirect, get_object_or_404
from django.http import Http404

from catalogue.forms.ArtistForm import ArtistForm
from catalogue.models import Artist


def index(request):
    artists = Artist.objects.all()
    return render(request, "artist/index.html", {
        "artists": artists,
    })


def show(request, artist_id):
    try:
        artist = Artist.objects.get(id=artist_id)
    except Artist.DoesNotExist:
        raise Http404("Artist inexistant")

    return render(request, "artist/show.html", {
        "artist": artist,
    })


def create(request):
    form = ArtistForm(request.POST or None)

    if request.method == "POST" and form.is_valid():
        form.save()
        return redirect("catalogue:artist-index")

    return render(request, "artist/create.html", {
        "form": form,
    })


def edit(request, artist_id):
    artist = get_object_or_404(Artist, id=artist_id)

    # On bind le form (POST) ou on l’affiche (GET)
    form = ArtistForm(request.POST or None, instance=artist)

    if request.method == "POST":
        method = request.POST.get("_method", "").upper()

        if method == "PUT":
            if form.is_valid():
                form.save()
                # après édition -> retour sur la page détail
                return redirect("catalogue:artist-show", artist_id=artist.id)

    return render(request, "artist/edit.html", {
        "form": form,
        "artist": artist,
    })


def delete(request, artist_id):
    """
    GET  -> affiche une page de confirmation
    POST -> si _method=DELETE, supprime puis redirige vers la liste
    """
    artist = get_object_or_404(Artist, id=artist_id)

    if request.method == "POST":
        method = request.POST.get("_method", "").upper()

        # Si tu n’utilises pas _method dans ton form, tu peux aussi accepter POST direct
        if method == "DELETE" or method == "":
            artist.delete()
            return redirect("catalogue:artist-index")

    # IMPORTANT: on rend un template de confirmation dédié
    return render(request, "artist/delete.html", {
        "artist": artist,
    })
