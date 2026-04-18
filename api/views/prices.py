from rest_framework.response import Response
from rest_framework.views import APIView

class PricesView(APIView):
    def get(self, request, *args, **kwargs):
        from catalogue.models import Price
        prices = Price.objects.all().order_by('price')
        data = [
            {
                'id': p.id,
                'type': p.type,
                'price': str(p.price),
            }
            for p in prices
        ]
        return Response(data)

    def post(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def put(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def delete(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

class PricesDetailView(APIView):
    def get(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)
    
    def post(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)
    
    def put(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)
    
    def delete(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)