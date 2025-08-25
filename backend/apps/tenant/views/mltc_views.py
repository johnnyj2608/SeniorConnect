from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from backend.apps.user.permissions import IsAdminUser
from ..utils.mltc_utils import (
    updateMltc,
    getMltcDetail,
    deleteMltc,
    getMltcList,
    createMltc
)

@api_view(['GET', 'POST'])
def getMltcs(request):
    if request.method == 'POST' and not IsAdminUser().has_permission(request, None):
        return Response({'detail': 'Admin access required.'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        return getMltcList(request)

    if request.method == 'POST':        
        return createMltc(request)

@api_view(['GET', 'PUT', 'DELETE'])
def getMltc(request, pk):
    if request.method in ['PUT', 'DELETE'] and not IsAdminUser().has_permission(request, None):
        return Response({'detail': 'Admin access required.'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        return getMltcDetail(request, pk=pk)

    if request.method == 'PUT':
        return updateMltc(request, pk=pk)

    if request.method == 'DELETE':
        return deleteMltc(request, pk=pk)