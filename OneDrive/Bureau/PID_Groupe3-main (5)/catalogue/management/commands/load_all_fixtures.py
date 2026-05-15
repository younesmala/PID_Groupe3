from django.core.management.base import BaseCommand
from django.core.management import call_command


class Command(BaseCommand):
    help = 'Load all fixtures in the correct order'

    def handle(self, *args, **kwargs):
        fixtures = [
            'catalogue/fixtures/auth_user.json',
            'catalogue/fixtures/groups.json',
            'catalogue/fixtures/localities.json',
            'catalogue/fixtures/locations.json',
            'catalogue/fixtures/types.json',
            'catalogue/fixtures/artist_type.json',
            'catalogue/fixtures/ArtistFixtures.json',
            'catalogue/fixtures/prices.json',
            'catalogue/fixtures/shows.json',
            'catalogue/fixtures/show_prices.json',
            'catalogue/fixtures/representations.json',
            'catalogue/fixtures/reservations.json',
            'catalogue/fixtures/representation_reservations.json',
            'catalogue/fixtures/reviews.json',
            'catalogue/fixtures/user_meta.json',
        ]
        for fixture in fixtures:
            try:
                call_command('loaddata', fixture)
                self.stdout.write(f'Loaded: {fixture}')
            except Exception as e:
                self.stdout.write(f'Skipped {fixture}: {e}')
