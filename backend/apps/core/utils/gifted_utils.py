from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import get_object_or_404
from ..models.gifted_model import Gifted
from backend.apps.tenant.models.gift_model import Gift
from ..serializers.gifted_serializers import GiftedSerializer, GiftedMemberSerializer
from ..serializers.member_serializers import MemberSimpleSerializer
from backend.access.member_access import member_access_filter, member_access_fk
from django.db.models import Q

@member_access_filter()
def getGiftedList(request):
    gifted = Gifted.objects.filter(member__in=request.accessible_members_qs)
    serializer = GiftedSerializer(gifted, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@member_access_fk
def getGiftedDetail(request, pk):
    gifted = get_object_or_404(Gifted, id=pk)
    serializer = GiftedSerializer(gifted)
    return Response(serializer.data, status=status.HTTP_200_OK)

@member_access_fk
def createGifted(request):
    data = request.data
    if data.get('received', False) in ['false', False]:
        return Response(status=status.HTTP_204_NO_CONTENT)
    serializer = GiftedSerializer(data=data)
    
    try:
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(e)
        return Response({"detail": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@member_access_fk
def updateGifted(request, pk):
    data = request.data
    gifted = get_object_or_404(Gifted, id=pk)

    if data.get('received', False) in ['false', False]:
        gifted.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = GiftedSerializer(instance=gifted, data=data)
    try:
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(e)
        return Response({"detail": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@member_access_fk
def deleteGifted(request, pk, member_pk):
    gifted = get_object_or_404(Gifted, id=pk)
    gifted.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

@member_access_fk
def getGiftedListByMember(request, member_pk):
    gifted = Gifted.objects.filter(member=member_pk)
    serializer = GiftedSerializer(gifted, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@member_access_filter()
def getReceivedMembersByGift(request, pk):
    gifted_entries = Gifted.objects.filter(gift_id=pk).select_related('member')
    serializer = GiftedMemberSerializer(gifted_entries, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@member_access_filter()
def getUnreceivedMembersByGift(request, pk):
    gift = get_object_or_404(Gift, id=pk)

    received_member_ids = Gifted.objects.filter(gift_id=pk).values_list('member_id', flat=True)
    qs = request.accessible_members_qs.exclude(id__in=received_member_ids)

    if gift.birth_month:
        qs = qs.filter(birth_date__month=gift.birth_month)

    if gift.mltc:
        qs = qs.filter(active_auth__mltc=gift.mltc)
    else:
        qs = qs.filter(active_auth__mltc__isnull=False)

    qs = qs.select_related('active_auth', 'active_auth__mltc')

    serializer = MemberSimpleSerializer(qs, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)