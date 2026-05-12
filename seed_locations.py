import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'reservations.settings')
django.setup()

from catalogue.models import Location, Locality

bxl = Locality.objects.get(id=1)
ixl = Locality.objects.get(id=3)
uca = Locality.objects.get(id=8)

venues = [
    {"slug":"theatre-royal-du-parc","designation":"Theatre Royal du Parc","address":"Rue de la Loi 3","locality":bxl,"phone":"+32 2 505 30 32","website":"https://www.theatreduparc.be"},
    {"slug":"palais-des-beaux-arts","designation":"Palais des Beaux-Arts (BOZAR)","address":"Rue Ravenstein 23","locality":bxl,"phone":"+32 2 507 82 00","website":"https://www.bozar.be"},
    {"slug":"theatre-les-tanneurs","designation":"Theatre Les Tanneurs","address":"Rue des Tanneurs 75","locality":bxl,"phone":"+32 2 512 17 84","website":"https://www.lestanneurs.be"},
    {"slug":"la-monnaie","designation":"La Monnaie / De Munt","address":"Place de la Monnaie","locality":bxl,"phone":"+32 70 23 39 39","website":"https://www.lamonnaie.be"},
    {"slug":"theatre-toison-or","designation":"Theatre de la Toison d Or","address":"Galerie de la Toison d Or 396","locality":ixl,"phone":"+32 2 510 00 10","website":"https://tto.be"},
    {"slug":"cirque-royal","designation":"Cirque Royal","address":"Rue de lEnseignement 81","locality":bxl,"phone":"+32 2 218 20 15","website":"https://www.cirque-royal.org"},
    {"slug":"kanal-centre-pompidou","designation":"KANAL Centre Pompidou","address":"Place de Yser 1","locality":bxl,"phone":"+32 2 278 62 47","website":"https://www.kanal.brussels"},
    {"slug":"theatre-de-poche","designation":"Theatre de Poche","address":"Chemin du Gymnase 1a","locality":uca,"phone":"+32 2 649 17 27","website":"https://www.poche.be"},
]

created = 0
for v in venues:
    if not Location.objects.filter(slug=v["slug"]).exists():
        Location.objects.create(**v)
        created += 1

print("Created", created, "Total:", Location.objects.count())
