from decimal import Decimal


class Cart:
    """Gestion du panier en session Django"""

    def __init__(self, request):
        self.session = request.session
        cart = self.session.get('cart')
        if not cart:
            cart = self.session['cart'] = {}
        self.cart = cart

    def add(self, representation, price, quantity=1, override_quantity=False):
        """Ajoute un item au panier"""
        key = f"{representation.id}_{price.id}"

        if override_quantity:
            self.cart[key] = {
                'representation_id': representation.id,
                'price_id': price.id,
                'quantity': quantity,
            }
        else:
            if key not in self.cart:
                self.cart[key] = {
                    'representation_id': representation.id,
                    'price_id': price.id,
                    'quantity': 0,
                }
            self.cart[key]['quantity'] += quantity

        self.session.modified = True

    def remove(self, representation, price):
        """Supprime un item du panier"""
        key = f"{representation.id}_{price.id}"
        if key in self.cart:
            del self.cart[key]
            self.session.modified = True

    def clear(self):
        """Vide le panier"""
        self.session['cart'] = {}
        self.cart = {}
        self.session.modified = True

    def __iter__(self):
        """Itère sur les items du panier avec les détails"""
        from catalogue.models import Representation, Price

        for key, item in self.cart.items():
            try:
                representation = Representation.objects.get(
                    id=item['representation_id'])
                price_obj = Price.objects.get(id=item['price_id'])

                unit_price = Decimal(str(price_obj.price))
                total_price = unit_price * Decimal(str(item['quantity']))

                yield {
                    'representation': representation,
                    'price': unit_price,
                    'price_obj': price_obj,
                    'quantity': item['quantity'],
                    'total_price': total_price,
                }
            except (Representation.DoesNotExist, Price.DoesNotExist):
                continue

    def get_total_price(self):
        """Calcule le prix total du panier"""
        total = Decimal('0')
        for item in self:
            total += item['total_price']
        return total

    def __len__(self):
        """Retourne le nombre d'items dans le panier"""
        return len(self.cart)
