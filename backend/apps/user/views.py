from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .permissions import IsAdminUser
from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from .utils import (
    updateUser,
    getUserDetail,
    deleteUser,
    getUserList,
    createUser,
    patchUser,
    getAuthUser,
    handleLogin,
    handleLogout,
    handleRefresh,
    resetPassword,
    setPassword,
)

@api_view(['GET', 'POST'])
def getUsers(request):
    if request.method == 'POST' and not IsAdminUser().has_permission(request, None):
        return Response({'detail': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        return getUserList(request)

    if request.method == 'POST':
        return createUser(request)

@api_view(['GET', 'PUT', 'DELETE', 'PATCH'])
def getUser(request, pk):
    if request.method in ['PUT', 'PATCH', 'DELETE'] and not IsAdminUser().has_permission(request, None):
        return Response({'detail': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        return getUserDetail(request, pk)

    if request.method == 'PUT':
        return updateUser(request, pk)
    
    if request.method == 'PATCH':
        return patchUser(request, pk)

    if request.method == 'DELETE':
        return deleteUser(request, pk)
    
@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def passwordReset(request):
    if request.method == 'POST':
        return resetPassword(request)
    
@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def passwordSet(request, uidb64, token):
    if request.method == 'POST':
        return setPassword(request, uidb64, token)

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