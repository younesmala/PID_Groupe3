import secrets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from api.models import AffiliateProfile
from catalogue.models.show import Show


def get_affiliate(user):
    try:
        return user.affiliate_profile
    except AffiliateProfile.DoesNotExist:
        return None


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_affiliate(request):
    if get_affiliate(request.user):
        return Response(
            {'error': 'Vous êtes déjà affilié.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    api_key = secrets.token_hex(32)
    affiliate = AffiliateProfile.objects.create(
        user=request.user,
        plan='free',
        api_key=api_key
    )
    return Response({
        'message': 'Compte affilié créé.',
        'plan': affiliate.plan,
        'api_key': affiliate.api_key,
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def affiliate_catalog(request):
    affiliate = get_affiliate(request.user)
    if not affiliate:
        return Response(
            {'error': 'Vous n\'êtes pas affilié.'},
            status=status.HTTP_403_FORBIDDEN
        )
    plan = affiliate.plan
    shows = Show.objects.all().order_by('id')

    if plan == 'free':
        shows = shows[:5]
        fields = ['id', 'title', 'bookable']
    elif plan == 'starter':
        shows = shows[:20]
        fields = ['id', 'title', 'bookable', 'duration']
    else:  # premium
        fields = [
            'id', 'title', 'bookable',
            'description', 'duration', 'created_at'
        ]

    data = []
    for show in shows:
        item = {}
        for f in fields:
            item[f] = getattr(show, f, None)
        data.append(item)

    return Response({
        'plan': plan,
        'count': len(data),
        'shows': data
    })


@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsAdminUser])
def upgrade_affiliate(request, user_id):
    plan = request.data.get('plan')
    if plan not in ['free', 'starter', 'premium']:
        return Response(
            {'error': 'Plan invalide.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    try:
        affiliate = AffiliateProfile.objects.get(user_id=user_id)
        affiliate.plan = plan
        affiliate.save()
        return Response({
            'message': f'Plan mis à jour : {plan}',
            'user': affiliate.user.username,
            'plan': affiliate.plan,
        })
    except AffiliateProfile.DoesNotExist:
        return Response(
            {'error': 'Affilié introuvable.'},
            status=status.HTTP_404_NOT_FOUND
        )
