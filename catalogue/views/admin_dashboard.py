from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User, Group
from django.contrib import messages
from django.shortcuts import render, redirect, get_object_or_404
from django.utils.decorators import method_decorator
from django.views import View

from catalogue.models import Show, Representation, Reservation, Artist


def _is_admin(user):
    return user.is_superuser or user.groups.filter(name='ADMIN').exists()


@method_decorator(login_required, name='dispatch')
class AdminDashboardView(View):
    def dispatch(self, request, *args, **kwargs):
        if not _is_admin(request.user):
            messages.error(request, "Accès réservé aux administrateurs.")
            return redirect('home')
        return super().dispatch(request, *args, **kwargs)

    def get(self, request):
        reservations_qs = Reservation.objects.select_related(
            'user').order_by('-booking_date')
        recent_users = User.objects.prefetch_related(
            'groups').order_by('-date_joined')[:5]

        context = {
            'total_users': User.objects.count(),
            'total_shows': Show.objects.count(),
            'total_representations': Representation.objects.count(),
            'total_reservations': reservations_qs.count(),
            'reservations_pending': reservations_qs.filter(status='PENDING').count(),
            'reservations_paid': reservations_qs.filter(status='PAID').count(),
            'reservations_failed': reservations_qs.filter(status='FAILED').count(),
            'total_artists': Artist.objects.count(),
            'recent_reservations': reservations_qs[:5],
            'recent_users': recent_users,
        }
        return render(request, 'admin/dashboard.html', context)


@method_decorator(login_required, name='dispatch')
class AdminUsersView(View):
    def dispatch(self, request, *args, **kwargs):
        if not _is_admin(request.user):
            messages.error(request, "Accès réservé aux administrateurs.")
            return redirect('home')
        return super().dispatch(request, *args, **kwargs)

    def get(self, request):
        users = User.objects.prefetch_related(
            'groups').order_by('-date_joined')
        return render(request, 'admin/user/index.html', {'users': users})


@method_decorator(login_required, name='dispatch')
class AdminUserEditView(View):
    def dispatch(self, request, *args, **kwargs):
        if not _is_admin(request.user):
            messages.error(request, "Accès réservé aux administrateurs.")
            return redirect('home')
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, pk):
        target = get_object_or_404(User, pk=pk)
        groups = Group.objects.filter(name__in=['MEMBER', 'ADMIN', 'PRODUCER'])
        current_group = target.groups.filter(
            name__in=['MEMBER', 'ADMIN', 'PRODUCER']).first()
        return render(request, 'admin/user/edit.html', {
            'target': target,
            'groups': groups,
            'current_group': current_group,
        })

    def post(self, request, pk):
        target = get_object_or_404(User, pk=pk)
        group_name = request.POST.get('group')
        try:
            new_group = Group.objects.get(name=group_name)
        except Group.DoesNotExist:
            messages.error(request, "Groupe invalide.")
            return redirect('catalogue:admin-user-edit', pk=pk)

        target.groups.remove(
            *Group.objects.filter(name__in=['MEMBER', 'ADMIN', 'PRODUCER']))
        target.groups.add(new_group)
        messages.success(
            request, f"Rôle de {target.username} changé en {group_name}.")
        return redirect('catalogue:admin-users')
