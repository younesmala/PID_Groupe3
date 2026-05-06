from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.contrib.auth.models import User, Group


class UsersMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        roles = list(user.groups.values_list('name', flat=True))
        role = user.profile.role if hasattr(user, 'profile') else 'USER'
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'roles': roles,
            'is_staff': user.is_staff,
            'role': role,
        })

    def put(self, request, *args, **kwargs):
        user = request.user
        data = request.data
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.email = data.get('email', user.email)
        user.save()
        roles = list(user.groups.values_list('name', flat=True))
        role = user.profile.role if hasattr(user, 'profile') else 'USER'
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'roles': roles,
            'is_staff': user.is_staff,
            'role': role,
        })

    def post(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def delete(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)


class UsersRolesView(APIView):
    """Get current user roles"""
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        roles = list(user.groups.values_list('name', flat=True))
        return Response({'roles': roles}, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def put(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)


class AdminUsersRolesView(APIView):
    """Admin endpoint to manage user roles"""
    permission_classes = [IsAdminUser]

    def get(self, request, id, *args, **kwargs):
        try:
            user = User.objects.get(id=id)
        except User.DoesNotExist:
            return Response(
                {'detail': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        roles = list(user.groups.values_list('name', flat=True))
        return Response({'roles': roles}, status=status.HTTP_200_OK)

    def post(self, request, id, *args, **kwargs):
        """Add role to user"""
        try:
            user = User.objects.get(id=id)
        except User.DoesNotExist:
            return Response(
                {'detail': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        role_name = request.data.get('role')
        if not role_name:
            return Response(
                {'detail': 'Role is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            group = Group.objects.get(name=role_name)
            user.groups.add(group)
            return Response(
                {'detail': f'Role {role_name} added'},
                status=status.HTTP_200_OK
            )
        except Group.DoesNotExist:
            return Response(
                {'detail': f'Role {role_name} not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    def delete(self, request, id, *args, **kwargs):
        """Remove role from user"""
        try:
            user = User.objects.get(id=id)
        except User.DoesNotExist:
            return Response(
                {'detail': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        role_name = request.data.get('role')
        if not role_name:
            return Response(
                {'detail': 'Role is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            group = Group.objects.get(name=role_name)
            user.groups.remove(group)
            return Response(
                {'detail': f'Role {role_name} removed'},
                status=status.HTTP_200_OK
            )
        except Group.DoesNotExist:
            return Response(
                {'detail': f'Role {role_name} not found'},
                status=status.HTTP_404_NOT_FOUND
            )

class UsersSubscriptionView(APIView):
    def get(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def post(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def put(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def delete(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)
