from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import get_object_or_404
from ..models.gift_model import Gift
from ..models.mltc_model import Mltc
from ..serializers.gift_serializers import GiftSerializer
from backend.access.ownership_access import require_sadc_ownership, require_org_admin
from django.db.models import Q
from django.utils import timezone

def getGiftList(request):
    gifts = list(
        Gift.objects.select_related('mltc')
        .filter(sadc=request.user.sadc)
    )
    today = timezone.now().date()

    def sort_key(gift):
        if gift.expires_at is None:
            return (2, None)
        elif gift.expires_at < today:
            return (3, -gift.expires_at.toordinal())
        elif gift.expires_at >= today:
            return (0, gift.expires_at)
        return (4, None)

    gifts_sorted = sorted(gifts, key=sort_key)

    serializer = GiftSerializer(gifts_sorted, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

def getGiftDetail(request, pk):
    current_user = request.user
    gift = get_object_or_404(Gift.objects.select_related('mltc'), id=pk)

    unauthorized = require_sadc_ownership(gift, current_user) or require_org_admin(current_user)
    if unauthorized: return unauthorized

    serializer = GiftSerializer(gift)
    return Response(serializer.data, status=status.HTTP_200_OK)

def createGift(request):
    current_user = request.user
    unauthorized = require_org_admin(current_user)
    if unauthorized: return unauthorized

    data = request.data.copy()
    data['sadc'] = request.user.sadc.id

    serializer = GiftSerializer(data=data)

    try:
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(e)
        return Response({"detail": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def updateGift(request, pk):
    current_user = request.user
    gift = get_object_or_404(Gift, id=pk)

    unauthorized = require_sadc_ownership(gift, current_user) or require_org_admin(current_user)
    if unauthorized: return unauthorized

    data = request.data.copy()
    data['sadc'] = request.user.sadc.id
    serializer = GiftSerializer(instance=gift, data=data)

    try:
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(e)
        return Response({"detail": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def deleteGift(request, pk):
    current_user = request.user
    gift = get_object_or_404(Gift, id=pk)

    unauthorized = require_sadc_ownership(gift, current_user) or require_org_admin(current_user)
    if unauthorized: return unauthorized

    gift.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)  

def getActiveGiftList(request):
    gifts = Gift.objects.select_related('mltc').filter(
        sadc=request.user.sadc
    ).filter(
        Q(expires_at__isnull=True) | Q(expires_at__gte=timezone.now().date())
    )

    birthdate_param = request.GET.get('birthdate')
    mltc_param = request.GET.get('mltc')

    if not birthdate_param and not mltc_param:
        serializer = GiftSerializer(gifts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    if birthdate_param: 
        birth_month = int(birthdate_param.split('-')[1])
        gifts = gifts.filter(Q(birth_month__isnull=True) | Q(birth_month=birth_month))

    if mltc_param: 
        mltc = Mltc.objects.get(name=mltc_param)
        gifts = gifts.filter(Q(mltc__isnull=True) | Q(mltc=mltc))

    serializer = GiftSerializer(gifts, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)