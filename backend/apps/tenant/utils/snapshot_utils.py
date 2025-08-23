from django.utils import timezone
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import get_object_or_404
from ..models.snapshot_model import Snapshot
from ..serializers.snapshot_serializers import SnapshotSerializer
from backend.access.ownership_access import require_sadc_ownership, require_org_admin

def getSnapshotList(request):
    current_user = request.user

    if not (current_user.is_superuser or current_user.is_org_admin):
        if not current_user.view_snapshots:
            return Response(
                {"detail": "Not authorized to view snapshots."},
                status=status.HTTP_403_FORBIDDEN
            )

    snapshots = Snapshot.objects.filter(sadc=current_user.sadc)
    filter_param = request.GET.get('filter')
    if filter_param:
        snapshots = snapshots.filter(type__iexact=filter_param)
    paginator = PageNumberPagination()
    result_page = paginator.paginate_queryset(snapshots, request)

    serializer = SnapshotSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)

def getSnapshotDetail(request, pk):
    current_user = request.user
    snapshot = get_object_or_404(Snapshot, id=pk)

    unauthorized = require_sadc_ownership(snapshot.sadc.id, current_user)
    if unauthorized: return unauthorized

    if not (current_user.is_superuser or current_user.is_org_admin):
        if not current_user.view_snapshots:
            return Response(
                {"detail": "Not authorized to view snapshots."},
                status=status.HTTP_403_FORBIDDEN
            )

    serializer = SnapshotSerializer(snapshot)
    return Response(serializer.data, status=status.HTTP_200_OK)


def createSnapshot(request):
    current_user = request.user
    unauthorized = require_org_admin(current_user)
    if unauthorized: return unauthorized

    data = request.data
    serializer = SnapshotSerializer(data=data)

    try:
        if serializer.is_valid():
            serializer.save(sadc=current_user.sadc)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(e)
        return Response({"detail": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def updateSnapshot(request, pk):
    current_user = request.user
    snapshot = get_object_or_404(Snapshot, id=pk)

    unauthorized = require_sadc_ownership(snapshot.sadc.id, current_user) or require_org_admin(current_user)
    if unauthorized: return unauthorized

    data = request.data
    serializer = SnapshotSerializer(instance=snapshot, data=data)

    try:
        if serializer.is_valid():
            serializer.save(sadc=current_user.sadc)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(e)
        return Response({"detail": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def deleteSnapshot(request, pk):
    current_user = request.user
    snapshot = get_object_or_404(Snapshot, id=pk)

    unauthorized = require_sadc_ownership(snapshot.sadc.id, current_user) or require_org_admin(current_user)
    if unauthorized: return unauthorized

    snapshot.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

def getRecentSnapshots(request):
    current_user = request.user

    if not (current_user.is_superuser or current_user.is_org_admin):
        if not current_user.view_snapshots:
            return Response(
                {"detail": "Not authorized to view snapshots."},
                status=status.HTTP_403_FORBIDDEN
            )
        
    now = timezone.now()

    snapshots = Snapshot.objects.filter(
        sadc=current_user.sadc,
        date__year=now.year,
        date__month=now.month
    )

    serializer = SnapshotSerializer(snapshots, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)