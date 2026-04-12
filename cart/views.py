from django.shortcuts import render, redirect, get_object_or_404
from django.views.decorators.http import require_POST
from django.contrib.auth.decorators import login_required
from django.contrib import messages

from catalogue.models import Representation, Price, Reservation, RepresentationReservation
from .cart import Cart


def cart_detail(request):
    cart = Cart(request)
    return render(request, 'cart/detail.html', {'cart': cart})


@require_POST
def cart_add(request, representation_id):
    cart = Cart(request)
    representation = get_object_or_404(Representation, id=representation_id)
    price_id = request.POST.get('price_id')
    override = request.POST.get('override_quantity') == 'true'

    try:
        quantity = int(request.POST.get('quantity', 1))
    except (TypeError, ValueError):
        messages.error(request, "Quantité invalide.")
        return redirect('cart:cart_detail')

    if quantity <= 0:
        messages.error(request, "La quantité doit être supérieure à zéro.")
        return redirect('cart:cart_detail')

    price = get_object_or_404(Price, id=price_id)

    # Calculate total quantity if we were to add this
    current_quantity = 0
    key = f"{representation.id}_{price.id}"
    if key in cart.cart:
        current_quantity = cart.cart[key]['quantity']
    
    new_total_quantity = quantity if override else (current_quantity + quantity)

    if representation.available_seats < new_total_quantity:
        messages.error(request, f"Seulement {representation.available_seats} places disponibles.")
        return redirect('cart:cart_detail')

    cart.add(representation=representation, price=price, quantity=quantity, override_quantity=override)
    return redirect('cart:cart_detail')


@require_POST
def cart_clear(request):
    Cart(request).clear()
    return redirect('cart:cart_detail')


@require_POST
def cart_remove(request, representation_id, price_id):
    cart = Cart(request)
    representation = get_object_or_404(Representation, id=representation_id)
    price = get_object_or_404(Price, id=price_id)
    cart.remove(representation, price)
    return redirect('cart:cart_detail')


@login_required
def cart_checkout(request):
    cart = Cart(request)
    if not cart.cart:
        messages.warning(request, "Votre panier est vide.")
        return redirect('cart:cart_detail')

    # Delete existing PENDING reservations for this user
    Reservation.objects.filter(user=request.user, status='PENDING').delete()

    # Group cart items by representation
    items_by_rep = {}
    for item in cart:
        rep = item['representation']
        if rep.id not in items_by_rep:
            items_by_rep[rep.id] = {'representation': rep, 'items': []}
        items_by_rep[rep.id]['items'].append(item)

    reservation_ids = []
    for rep_id, group in items_by_rep.items():
        reservation = Reservation.objects.create(
            user=request.user,
            status='PENDING'
        )
        for item in group['items']:
            RepresentationReservation.objects.create(
                reservation=reservation,
                representation=group['representation'],
                price=item['price_obj'],
                quantity=item['quantity']
            )
        reservation_ids.append(str(reservation.id))

    ids_str = ','.join(reservation_ids)
    return redirect('cart:payment_simulation', reservation_id=ids_str)


def payment_simulation(request, reservation_id):
    ids = [int(i) for i in reservation_id.split(',') if i.strip()]
    reservations = Reservation.objects.filter(id__in=ids)

    if request.method == 'POST':
        action = request.POST.get('action')
        if action == 'success':
            for reservation in reservations:
                reservation.status = 'PAID'
                reservation.save()
                for rr in reservation.representation_reservations.all():
                    rr.representation.available_seats -= rr.quantity
                    rr.representation.save()
            Cart(request).clear()
            return redirect('accounts:user-profile')
        elif action == 'failure':
            for reservation in reservations:
                reservation.status = 'FAILED'
                reservation.save()
            return redirect('cart:cart_detail')

    return render(request, 'cart/payment_simulation.html', {
        'reservations': reservations,
        'reservation_id': reservation_id,
    })


@login_required
def reservation_detail(request, reservation_id):
    reservation = get_object_or_404(Reservation, id=reservation_id, user=request.user)
    items = reservation.representation_reservations.select_related('representation', 'price').all()
    total = sum(rr.price.price * rr.quantity for rr in items)
    return render(request, 'cart/reservation_detail.html', {
        'reservation': reservation,
        'items': items,
        'total': total,
    })
