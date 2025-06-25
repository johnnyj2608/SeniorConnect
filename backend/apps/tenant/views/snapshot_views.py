from rest_framework.response import Response
from rest_framework.decorators import api_view
from ...user.permissions import IsAdminUser
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

    if request.method == 'GET':
        return getSnapshotList(request)

    if request.method == 'POST':
        permission = IsAdminUser()
        if not permission.has_permission(request, None):
            return Response({'detail': 'Admin access required.'}, status=403)
        return createSnapshot(request)


@api_view(['GET', 'PUT', 'DELETE'])
def getSnapshot(request, pk):

    if request.method == 'GET':
        return getSnapshotDetail(request, pk)
    
    permission = IsAdminUser()
    if not permission.has_permission(request, None):
        return Response({'detail': 'Admin access required.'}, status=403)

    if request.method == 'PUT':
        return updateSnapshot(request, pk)

    if request.method == 'DELETE':
        return deleteSnapshot(request, pk)

@api_view(['GET'])
def getRecentSnapshotLogs(request):
    if request.method == 'GET':
        return getRecentSnapshots(request)