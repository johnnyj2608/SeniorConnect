from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .permissions import IsAdminUser
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from .utils import (
    updateUser,
    getUserDetail,
    deleteUser,
    getUserList,
    createUser,
    getAuthUser,
    handleLogin,
    handleLogout,
    handleRefresh,
)

@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
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

@api_view(['GET'])
def getAuthenticatedUser(request):
    
    if request.method == 'GET':
        return getAuthUser(request)

@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def cookieLogin(request):
    if request.method == 'POST':
        return handleLogin(request)

@api_view(['POST'])
def cookieLogout(request):
    if request.method == 'POST':
        return handleLogout(request)

@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def cookieRefresh(request):
    if request.method == 'POST':
        return handleRefresh(request)