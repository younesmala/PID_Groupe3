from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group


class Command(BaseCommand):
    help = 'Create default groups: MEMBER, ADMIN, PRODUCER'

    def handle(self, *args, **kwargs):
        groups = ['MEMBER', 'ADMIN', 'PRODUCER']
        for name in groups:
            group, created = Group.objects.get_or_create(name=name)
            if created:
                self.stdout.write(f'Group "{name}" created.')
            else:
                self.stdout.write(f'Group "{name}" already exists.')
