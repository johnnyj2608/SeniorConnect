from rest_framework.response import Response
from rest_framework.decorators import api_view
from user.permissions import IsAdminUser
from ..utils.mltc_utils import (
    updateMLTC,
    getMLTCDetail,
    deleteMLTC,
    getMLTCList,
    createMLTC
)

@api_view(['GET', 'POST'])
def getMLTCs(request):
    if request.method == 'GET':
        return getMLTCList(request)

    
    if request.method == 'POST':
        permission = IsAdminUser()
        if not permission.has_permission(request, None):
            return Response({'detail': 'Admin access required.'}, status=403)
        return createMLTC(request)

@api_view(['GET', 'PUT', 'DELETE'])
def getMLTC(request, pk):
    if request.method == 'GET':
        return getMLTCDetail(request, pk=pk)

    permission = IsAdminUser()
    if not permission.has_permission(request, None):
        return Response({'detail': 'Admin access required.'}, status=403)

    if request.method == 'PUT':
        return updateMLTC(request, pk=pk)

    if request.method == 'DELETE':
        return deleteMLTC(request, pk=pk)