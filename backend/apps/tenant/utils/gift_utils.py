from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import get_object_or_404
from ..models.gift_model import Gift
from ..serializers.gift_serializers import GiftSerializer

def getGiftList(request):
    gifts = Gift.objects.select_related('sadc', 'mltc').filter(sadc=request.user.sadc)

    user = request.user
    if not (user.is_superuser or user.is_org_admin):
        gifts = gifts.filter(id__in=user.allowed_gifts.values_list('id', flat=True))

    serializer = GiftSerializer(gifts, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

def getGiftDetail(request, pk):
    current_user = request.user
    gift = get_object_or_404(Gift.objects.select_related('sadc', 'mltc'), id=pk)

    if gift.sadc_id != current_user.sadc_id:
        return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

    if current_user.is_org_admin:
        serializer = GiftSerializer(gift)
        return Response(serializer.data, status=status.HTTP_200_OK)

    return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

def createGift(request):
    current_user = request.user
    if not (current_user.is_org_admin):
        return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)
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
    gift = get_object_or_404(Gift.objects.select_related('sadc', 'mltc'), id=pk)

    if gift.sadc_id != current_user.sadc_id:
        return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

    if not (current_user.is_org_admin):
        return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

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
    gift = get_object_or_404(Gift.objects.select_related('sadc', 'mltc'), id=pk)

    if gift.sadc_id != current_user.sadc_id:
        return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)
    
    if not current_user.is_org_admin:
        return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

    gift.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)  