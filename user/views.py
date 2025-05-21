from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from .utils import (
    updateStaffUser,
    getStaffUserDetail,
    deleteStaffUser,
    getStaffUserList,
    createStaffUser,
)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def getStaffUsers(request):

    if request.method == 'GET':
        return getStaffUserList(request)

    if request.method == 'POST':
        return createStaffUser(request)


@api_view(['GET', 'PUT', 'DELETE'])
def getStaffUser(request, pk):

    if request.method == 'GET':
        return getStaffUserDetail(request, pk)

    if request.method == 'PUT':
        return updateStaffUser(request, pk)

    if request.method == 'DELETE':
        return deleteStaffUser(request, pk)