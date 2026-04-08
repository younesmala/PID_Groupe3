from decimal import Decimal
from django.conf import settings


class Cart:
    def __init__(self, request):
        self.session = request.session
        cart = self.session.get(settings.CART_SESSION_ID)
        if not cart:
            cart = self.session[settings.CART_SESSION_ID] = {}
        self.cart = cart

    def add(self, representation, price, quantity=1, override_quantity=False):
        key = f"{representation.id}_{price.id}"
        if key not in self.cart:
            self.cart[key] = {'quantity': 0, 'price': str(price.price)}
        if override_quantity:
            self.cart[key]['quantity'] = quantity
        else:
            self.cart[key]['quantity'] += quantity
        self.save()

    def save(self):
        self.session.modified = True

    def remove(self, representation, price):
        key = f"{representation.id}_{price.id}"
        if key in self.cart:
            del self.cart[key]
            self.save()

    def __iter__(self):
        from catalogue.models import Representation, Price

        rep_ids = set()
        price_ids = set()
        for key in self.cart:
            rep_id, price_id = key.split('_')
            rep_ids.add(int(rep_id))
            price_ids.add(int(price_id))

        representations = {r.id: r for r in Representation.objects.filter(id__in=rep_ids)}
        prices = {p.id: p for p in Price.objects.filter(id__in=price_ids)}

        cart = self.cart.copy()
        for key, item in cart.items():
            rep_id, price_id = key.split('_')
            item = item.copy()
            item['representation'] = representations[int(rep_id)]
            item['price_obj'] = prices[int(price_id)]
            item['key'] = key
            item['total_price'] = Decimal(item['price']) * item['quantity']
            yield item

    def __len__(self):
        return sum(item['quantity'] for item in self.cart.values())

    def get_total_price(self):
        return sum(Decimal(item['price']) * item['quantity'] for item in self.cart.values())

    def clear(self):
        del self.session[settings.CART_SESSION_ID]
        self.save()
