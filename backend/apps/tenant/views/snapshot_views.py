from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from ..utils.snapshot_utils import (
    updateSnapshot,
    getSnapshotDetail,
    deleteSnapshot,
    getSnapshotList,
    createSnapshot,
    getRecentSnapshots,
)

@api_view(['GET', 'POST'])
def getSnapshots(request):
    if request.method == 'POST' and not request.user.is_superuser:
        return Response({'detail': 'Super user access required.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        return getSnapshotList(request)

    if request.method == 'POST':
        return createSnapshot(request)

@api_view(['GET', 'PUT', 'DELETE'])
def getSnapshot(request, pk):
    if request.method in ['PUT', 'DELETE'] and not request.user.is_superuser:
        return Response({'detail': 'Super user access required.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        return getSnapshotDetail(request, pk)
    
    if request.method == 'PUT':
        return updateSnapshot(request, pk)

    if request.method == 'DELETE':
        return deleteSnapshot(request, pk)

@api_view(['GET'])
def getRecentSnapshotLogs(request):
    if request.method == 'GET':
        return getRecentSnapshots(request)