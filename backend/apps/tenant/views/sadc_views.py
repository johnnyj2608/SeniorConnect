from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from ...user.permissions import IsAdminUser
from ..utils.sadc_utils import (
    getSadcDetail,
    updateSadc,
)

@api_view(['GET', 'PUT'])
def getSadc(request):
    if request.method == 'PUT' and not IsAdminUser().has_permission(request, None):
        return Response({'detail': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        return getSadcDetail(request)
    
    if request.method == 'PUT':
        return updateSadc(request)