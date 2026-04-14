from django.db.models.signals import post_save
from django.contrib.auth.models import User, Group
from django.dispatch import receiver


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if kwargs.get('raw', False):
        return
    if created:
        try:
            group = Group.objects.get(name='MEMBER')
            instance.groups.add(group)
        except Group.DoesNotExist:
            pass
