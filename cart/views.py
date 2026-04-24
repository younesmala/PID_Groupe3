from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.views.decorators.http import require_POST

from .cart import Cart
from catalogue.models import Price, Representation, Reservation
from catalogue.models.reservation import RepresentationReservation


def cart_detail(request):
    cart = Cart(request)
    return render(request, "cart/detail.html", {"cart": cart})


def cart_add(request, representation_id):
    if request.method != "POST":
        return redirect('cart:cart_detail')

    representation = get_object_or_404(Representation, id=representation_id)
    price_id = request.POST.get('price_id')
    price = get_object_or_404(Price, id=price_id)
    quantity = request.POST.get('quantity', 1)
    override = request.POST.get('override_quantity') in ['true', 'True', '1', 'on']

    try:
        quantity = int(quantity)
    except (TypeError, ValueError):
        quantity = 1

    Cart(request).add(representation, price, quantity=quantity, override_quantity=override)
    return redirect('cart:cart_detail')


def cart_remove(request, representation_id, price_id):
    if request.method == 'POST':
        representation = get_object_or_404(Representation, id=representation_id)
        price = get_object_or_404(Price, id=price_id)
        Cart(request).remove(representation, price)
    return redirect('cart:cart_detail')


def cart_clear(request):
    if request.method == 'POST':
        Cart(request).clear()
    return redirect('cart:cart_detail')


@login_required
def cart_checkout(request):
    cart = Cart(request)

    if request.method == 'POST':
        if len(cart) == 0:
            return redirect('cart:cart_detail')

        # Crée une réservation par item du panier
        reservation_ids = []
        for item in cart:
            reservation = Reservation.objects.create(
                user=request.user,
                representation=item['representation'],
                quantity=item['quantity'],
                status='pending',
                payment_status='pending',
            )
            RepresentationReservation.objects.create(
                reservation=reservation,
                representation=item['representation'],
                price=item['price_obj'],
                quantity=item['quantity'],
            )
            reservation_ids.append(str(reservation.id))

        # Stocke les IDs en session pour la simulation de paiement
        request.session['pending_reservation_ids'] = reservation_ids
        reservation_id = reservation_ids[0] if len(
            reservation_ids) == 1 else ','.join(reservation_ids)
        return redirect('cart:payment_simulation', reservation_id=reservation_id)

    return render(request, 'cart/checkout.html', {'cart': cart})


@login_required
def payment_simulation(request, reservation_id):
    ids = [int(i) for i in reservation_id.split(',')]
    reservations = Reservation.objects.filter(pk__in=ids, user=request.user)

    if request.method == 'POST':
        action = request.POST.get('action')

        if action == 'success':
            reservations.update(status='confirmed', payment_status='paid')
            # Décrémenter les places disponibles
            for reservation in reservations:
                rep = reservation.representation
                rep.available_seats = max(
                    0, rep.available_seats - reservation.quantity)
                rep.save()
            Cart(request).clear()
            return redirect('cart:reservation_detail', reservation_id=ids[0])

        elif action == 'failure':
            reservations.update(status='failed', payment_status='failed')
            return redirect('cart:cart_detail')

    return render(request, 'cart/payment_simulation.html', {'reservation_id': reservation_id})


@login_required
def reservation_detail(request, reservation_id):
    reservation = get_object_or_404(
        Reservation, pk=reservation_id, user=request.user)
    items = reservation.representation_reservations.select_related(
        'representation', 'price').all()
    total = sum(item.subtotal for item in items)
    return render(request, 'cart/reservation_detail.html', {
        'reservation': reservation,
        'items': items,
        'total': total,
    })
