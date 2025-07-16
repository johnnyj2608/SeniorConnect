from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import get_object_or_404
from ..models.gift_model import Gift
from ..serializers.gift_serializers import GiftSerializer
from backend.access.ownership_access import require_sadc_ownership, require_org_admin

def getGiftList(request):
    gifts = Gift.objects.filter(sadc=request.user.sadc)

    user = request.user
    if not (user.is_superuser or user.is_org_admin):
        gifts = gifts.filter(id__in=user.allowed_gifts.values_list('id', flat=True))

    serializer = GiftSerializer(gifts, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

def getGiftDetail(request, pk):
    current_user = request.user
    gift = get_object_or_404(Gift, id=pk)

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