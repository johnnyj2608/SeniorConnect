from django.utils import timezone
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import get_object_or_404
from ..models.snapshot_model import Snapshot
from ..serializers.snapshot_serializers import SnapshotSerializer

def getSnapshotList(request):
    snapshots = Snapshot.objects.filter(sadc=request.user.sadc)
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

    if snapshot.sadc_id != current_user.sadc_id:
        return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

    if current_user.is_org_admin:
        serializer = SnapshotSerializer(snapshot)
        return Response(serializer.data, status=status.HTTP_200_OK)

    return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

def createSnapshot(request):
    data = request.data
    serializer = SnapshotSerializer(data=data)

    try:
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(e)
        return Response({"detail": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def updateSnapshot(request, pk):
    data = request.data
    snapshot = get_object_or_404(Snapshot, id=pk)
    serializer = SnapshotSerializer(instance=snapshot, data=data)

    try:
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(e)
        return Response({"detail": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def deleteSnapshot(request, pk):
    snapshot = get_object_or_404(Snapshot, id=pk)
    snapshot.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

def getRecentSnapshots(request):
    current_user = request.user
    now = timezone.now()
    
    snapshots = Snapshot.objects.filter(
        sadc=current_user.sadc,
        date__year=now.year,
        date__month=now.month
    )
    serializer = SnapshotSerializer(snapshots, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)