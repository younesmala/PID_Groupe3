from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django.contrib.auth.models import Group
from catalogue.models import UserMeta
from django.db import models


class UserSignUpForm(UserCreationForm):
    class Language(models.TextChoices):
        NONE = "", "Choisissez votre langue"
        FRENCH = "fr", "Français"
        ENGLISH = "en", "English"
        DUTCH = "nl", "Nederlands"

    # Définir les types de champs
    username = forms.CharField(max_length=30)
    first_name = forms.CharField(max_length=60)
    last_name = forms.CharField(max_length=60)
    email = forms.EmailField()

    # Ajout des champs de données personnelles supplémentaires
    langue = forms.ChoiceField(
        choices=Language.choices,
        required=False
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['username'].label = 'Login'
        self.fields['password1'].label = 'Mot de passe'
        self.fields['password2'].label = 'Confirmation du mot de passe'
        self.fields['first_name'].label = 'Prénom'
        self.fields['last_name'].label = 'Nom'

        self.fields['username'].help_text = None
        self.fields['password1'].help_text = None
        self.fields['password2'].help_text = None

    class Meta:
        model = User

        fields = [
            'username',
            'email',
            'password1',
            'password2',
            'first_name',
            'last_name',
            'langue',
        ]

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data.get("email", "")
        user.first_name = self.cleaned_data.get("first_name", "")
        user.last_name = self.cleaned_data.get("last_name", "")

     # Ajout de l'utilisateur au groupe MEMBER => rôle de membre
        if commit:
            user.save()
            memberGroup, _ = Group.objects.get_or_create(name="MEMBER")
            memberGroup.user_set.add(user)

            langue = self.cleaned_data.get("langue") or "fr"
            UserMeta.objects.create(user=user, langue=langue)

        return user



