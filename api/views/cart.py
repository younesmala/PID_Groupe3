from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from catalogue.models.representation import Representation
from api.serializers.cart import CartSerializer


class CartView(APIView):
    def get(self, request, *args, **kwargs):
        cart = request.session.get('cart', [])
        serializer = CartSerializer({'items': cart})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request, *args, **kwargs):
        return Response({"detail": "Use /cart/add/ to add items"}, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, *args, **kwargs):
        return Response({"detail": "Use /cart/update/ to update items"}, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, *args, **kwargs):
        request.session['cart'] = []
        request.session.modified = True
        return Response({"message": "Cart cleared"}, status=status.HTTP_200_OK)


class CartAddView(APIView):
    def post(self, request, *args, **kwargs):
        representation_id = request.data.get('representation_id')
        quantity = request.data.get('quantity', 1)
        
        if not representation_id:
            return Response({"error": "representation_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            representation = Representation.objects.get(id=representation_id)
        except Representation.DoesNotExist:
            return Response({"error": "Representation not found"}, status=status.HTTP_404_NOT_FOUND)
        
        cart = request.session.get('cart', [])
        
        # Vérifier si déjà dans le panier
        for item in cart:
            if item['representation_id'] == representation_id:
                item['quantity'] += quantity
                break
        else:
            cart.append({'representation_id': representation_id, 'quantity': quantity})
        
        request.session['cart'] = cart
        request.session.modified = True
        
        return Response({"message": "Item added to cart"}, status=status.HTTP_201_CREATED)


class CartUpdateView(APIView):
    def put(self, request, *args, **kwargs):
        representation_id = request.data.get('representation_id')
        quantity = request.data.get('quantity')
        
        if not representation_id or quantity is None:
            return Response({"error": "representation_id and quantity are required"}, status=status.HTTP_400_BAD_REQUEST)
        
        cart = request.session.get('cart', [])
        
        for item in cart:
            if item['representation_id'] == representation_id:
                if quantity <= 0:
                    cart.remove(item)
                else:
                    item['quantity'] = quantity
                break
        else:
            return Response({"error": "Item not in cart"}, status=status.HTTP_404_NOT_FOUND)
        
        request.session['cart'] = cart
        request.session.modified = True
        
        return Response({"message": "Cart updated"}, status=status.HTTP_200_OK)


class CartRemoveView(APIView):
    def delete(self, request, *args, **kwargs):
        representation_id = request.data.get('representation_id')
        
        if not representation_id:
            return Response({"error": "representation_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        cart = request.session.get('cart', [])
        
        for item in cart:
            if item['representation_id'] == representation_id:
                cart.remove(item)
                break
        else:
            return Response({"error": "Item not in cart"}, status=status.HTTP_404_NOT_FOUND)
        
        request.session['cart'] = cart
        request.session.modified = True
        
        return Response({"message": "Item removed from cart"}, status=status.HTTP_200_OK)