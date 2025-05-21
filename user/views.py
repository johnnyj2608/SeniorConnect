from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from .utils import (
    updateUser,
    getUserDetail,
    deleteUser,
    getUserList,
    createUser,
)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def getUsers(request):

    if request.method == 'GET':
        return getUserList(request)

    if request.method == 'POST':
        return createUser(request)


@api_view(['GET', 'PUT', 'DELETE'])
def getUser(request, pk):

    if request.method == 'GET':
        return getUserDetail(request, pk)

    if request.method == 'PUT':
        return updateUser(request, pk)

    if request.method == 'DELETE':
        return deleteUser(request, pk)