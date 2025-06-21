from rest_framework.response import Response
from rest_framework.decorators import api_view
from ...user.permissions import IsAdminUser
from ..utils.sadc_utils import (
    getSadcDetail,
    updateSadc,
)

@api_view(['GET', 'PUT'])
def getSadc(request):
    permission = IsAdminUser()
    if not permission.has_permission(request, None):
        return Response({'detail': 'Admin access required.'}, status=403)
    
    if request.method == 'GET':
        return getSadcDetail(request)
    
    if request.method == 'PUT':
        return updateSadc(request)