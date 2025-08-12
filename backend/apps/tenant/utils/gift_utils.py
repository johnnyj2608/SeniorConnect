from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import get_object_or_404
from ..models.gift_model import Gift
from backend.apps.core.models.gifted_model import Gifted
from ..serializers.gift_serializers import GiftSerializer, SimpleGiftSerializer
from backend.access.ownership_access import require_sadc_ownership, require_org_admin
from django.db.models import Q
from django.utils import timezone
from backend.apps.tenant.models.mltc_model import Mltc
from backend.utils.pdf_utils import generateSnapshotPdf
from django.http import FileResponse
from django.utils.encoding import smart_str

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

    unauthorized = require_sadc_ownership(gift, current_user)
    if unauthorized: return unauthorized

    serializer = GiftSerializer(gift)
    return Response(serializer.data, status=status.HTTP_200_OK)

def createGift(request):
    current_user = request.user

    data = request.data
    serializer = GiftSerializer(data=data)

    try:
        if serializer.is_valid():
            serializer.save(sadc=current_user.sadc)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(e)
        return Response({"detail": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def updateGift(request, pk):
    current_user = request.user
    gift = get_object_or_404(Gift, id=pk)

    unauthorized = require_sadc_ownership(gift, current_user)
    if unauthorized: return unauthorized

    data = request.data
    serializer = GiftSerializer(instance=gift, data=data)

    try:
        if serializer.is_valid():
            serializer.save(sadc=current_user.sadc)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(e)
        return Response({"detail": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def deleteGift(request, pk):
    current_user = request.user
    gift = get_object_or_404(Gift, id=pk)

    unauthorized = require_sadc_ownership(gift, current_user)
    if unauthorized: return unauthorized

    gift.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)  

def getActiveGiftListByMember(sadc, member):
    birth_month = member.birth_date.month
    mltc = member.active_auth.mltc if member.active_auth else None

    received_gift_ids = Gifted.objects.filter(
        member=member
    ).values_list('gift_id', flat=True)

    gifts = Gift.objects.select_related('mltc').filter(
        sadc=sadc
    ).filter(
        Q(expires_at__isnull=True) | Q(expires_at__gte=timezone.now().date())
    ).exclude(
        id__in=received_gift_ids
    ).filter(
        Q(birth_month__isnull=True) | Q(birth_month=birth_month)
    )

    if mltc:
        gifts = gifts.filter(Q(mltc__isnull=True) | Q(mltc=mltc))
    else:
        gifts = gifts.filter(mltc__isnull=True)

    return SimpleGiftSerializer(gifts, many=True).data

def getReceivedMembersByGift(request, pk):
    user = request.user
    sadc = user.sadc
    mltcs = Mltc.objects.filter(sadc=sadc)

    if not (user.is_superuser or user.is_org_admin):
        mltcs = mltcs.filter(id__in=user.allowed_mltcs.values_list('id', flat=True))

    mltc_names = list(mltcs.values_list('name', flat=True))
    file, file_name, pages = generateSnapshotPdf(
        sadc_id=sadc.id,
        snapshot_type="gifts_received",
        mltc_names=mltc_names,
        gift_id=pk,
    )

    return FileResponse(
        file,
        as_attachment=True,
        filename=smart_str(file_name),
        content_type='application/pdf'
    )

def getUnreceivedMembersByGift(request, pk):
    user = request.user

    sadc = request.user.sadc
    mltcs = Mltc.objects.filter(sadc=sadc)

    if not (user.is_superuser or user.is_org_admin):
        mltcs = mltcs.filter(id__in=user.allowed_mltcs.values_list('id', flat=True))

    mltc_names = list(mltcs.values_list('name', flat=True))
    file, file_name, pages = generateSnapshotPdf(
        sadc_id=sadc.id,
        snapshot_type="gifts_unreceived",
        mltc_names=mltc_names,
        gift_id=pk,
    )

    return FileResponse(
        file,
        as_attachment=True,
        filename=smart_str(file_name),
        content_type='application/pdf'
    )