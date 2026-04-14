from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse

from .cart import Cart
from catalogue.models import Price, Representation, Reservation


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
        return render(request, 'cart/checkout.html', {'cart': cart})
    return render(request, 'cart/checkout.html', {'cart': cart})


@login_required
def payment_simulation(request, reservation_id):
    return render(request, 'cart/payment_simulation.html', {'reservation_id': reservation_id})


@login_required
def reservation_detail(request, reservation_id):
    reservation = get_object_or_404(Reservation, id=reservation_id)
    items = reservation.representation_reservations.all()
    total = sum(item.subtotal for item in items)
    return render(request, 'cart/reservation_detail.html', {
        'reservation': reservation,
        'items': items,
        'total': total,
    })
