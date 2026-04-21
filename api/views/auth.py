from django.contrib.auth import authenticate
from django.contrib.auth import login as auth_login
from django.contrib.auth import logout as auth_logout
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.response import Response
from rest_framework.views import APIView


class AuthSignupView(APIView):
    def post(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)


@method_decorator(csrf_exempt, name='dispatch')
class AuthLoginView(APIView):
    def post(self, request, *args, **kwargs):
        username = request.data.get('username', '')
        password = request.data.get('password', '')

        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response(
                {"success": False, "error": "Identifiants incorrects"},
                status=400
            )

        auth_login(request, user)
        return Response({
            "success": True,
            "username": user.username,
            "email": user.email,
        })


@method_decorator(csrf_exempt, name='dispatch')
class AuthLogoutView(APIView):
    def post(self, request, *args, **kwargs):
        auth_logout(request)
        return Response({"success": True, "message": "Déconnecté"})
