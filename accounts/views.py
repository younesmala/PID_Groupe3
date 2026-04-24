from django.urls import reverse_lazy
from django.views.generic.edit import CreateView, UpdateView
from django.contrib.auth.mixins import UserPassesTestMixin
from django.shortcuts import redirect, render
from django.contrib import messages
from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User, Group
from .forms.UserSignUpForm import UserSignUpForm
from .forms.UserUpdateForm import UserUpdateForm


class UserUpdateView(UserPassesTestMixin, UpdateView):
    model = User
    form_class = UserUpdateForm
    success_url = reverse_lazy("accounts:user-profile")
    template_name = "user/update.html"

    def test_func(self):
        pkInURL = self.kwargs['pk']
        return self.request.user.is_authenticated and self.request.user.id == pkInURL or self.request.user.is_superuser

    def handle_no_permission(self):
        messages.error(
            self.request, "Vous n'avez pas l'autorisation d'accéder à cette page!")
        return redirect('accounts:user-profile')


class UserSignUpView(UserPassesTestMixin, CreateView):
    form_class = UserSignUpForm
    success_url = reverse_lazy("login")
    template_name = "registration/signup.html"

    def form_valid(self, form):
        response = super().form_valid(form)
        user = self.object
        try:
            member_group = Group.objects.get(name='MEMBER')
            user.groups.add(member_group)
        except Group.DoesNotExist:
            pass
        return response

    def test_func(self):
        return self.request.user.is_anonymous or self.request.user.is_superuser

    def handle_no_permission(self):
        messages.error(self.request, "Vous êtes déjà inscrit!")
        return redirect('home')


@login_required
def profile(request):
    languages = {
        "fr": "Français",
        "en": "English",
        "nl": "Nederlands",
    }

    user_reservations = request.user.reservations.select_related(
        'representation__show',
        'representation__location',
    ).order_by('-booking_date')

    def is_ticket_reservation(reservation):
        status = (reservation.status or '').lower()
        payment_status = (reservation.payment_status or '').lower()
        return (
            status in {'confirmed', 'paid'}
            or payment_status in {'paid'}
        )

    ticket_reservations = [
        reservation for reservation in user_reservations
        if is_ticket_reservation(reservation)
    ]

    user_lang_code = getattr(request.user.usermeta, 'langue', 'fr')

    return render(request, 'user/profile.html', {
        "user_language": languages.get(user_lang_code, "Français"),
        "reservations": user_reservations,
        "ticket_reservations": ticket_reservations,
    })


@login_required
def delete(request, pk):
    if request.method == 'POST':
        method = request.POST.get('_method', '').upper()

        if method == 'DELETE':
            if request.user and request.user.id == pk:
                user = User.objects.get(id=request.user.id)
                user.delete()

                messages.success(request, "Utilisateur supprimé avec succès.")
                logout(request)
            else:
                messages.error(request,
                               "Suppression d'un autre compte interdite!")

            return redirect('home')

    messages.error(request, "Suppression interdite (méthode incorrecte)!")

    return redirect('home')
