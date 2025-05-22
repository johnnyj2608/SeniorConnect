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
)
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.conf import settings

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
    
@api_view(['POST'])
def cookieLogin(request):
    email = request.data.get('email')
    password = request.data.get('password')
    user = authenticate(request, email=email, password=password)

    if user is not None:
        refresh = RefreshToken.for_user(user)
        res = Response({'message': 'Logged in successfully'})

        res.set_cookie(
            key='access',
            value=str(refresh.access_token),
            httponly=True,
            secure=not settings.DEBUG,
            samesite='Lax',
        )
        res.set_cookie(
            key='refresh',
            value=str(refresh),
            httponly=True,
            secure=not settings.DEBUG,
            samesite='Lax',
        )
        return res

    return Response({'detail': 'Invalid credentials'}, status=401)

@api_view(['POST'])
def cookieLogout(request):
    res = Response({'message': 'Logged out successfully'})
    res.delete_cookie('access')
    res.delete_cookie('refresh')
    return res