from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .permissions import IsAdminUser
from rest_framework.decorators import api_view, permission_classes
from .utils import (
    updateUser,
    getUserDetail,
    deleteUser,
    getUserList,
    createUser,
    getAuthUser,
    handleLogin,
    handleLogout,
)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def getUsers(request):

    if request.method == 'GET':
        return getUserList(request)

    if request.method == 'POST':
        return createUser(request)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def getUser(request, pk):

    if request.method == 'GET':
        return getUserDetail(request, pk)

    if request.method == 'PUT':
        return updateUser(request, pk)

    if request.method == 'DELETE':
        return deleteUser(request, pk)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getAuthenticatedUser(request):
    
    if request.method == 'GET':
        return getAuthUser(request)
    
@api_view(['POST'])
def cookieLogin(request):
    if request.method == 'POST':
        return handleLogin(request)

@api_view(['POST'])
def cookieLogout(request):
    if request.method == 'POST':
        return handleLogout(request)