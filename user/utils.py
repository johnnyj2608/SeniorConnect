from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import get_object_or_404
from .models import User
from .serializers import UserSerializer
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from django.contrib.auth import authenticate
from django.conf import settings

def getUserList(request):
    current_user = request.user
    if not (current_user.is_org_admin):
        return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

def getUserDetail(request, pk):
    current_user = request.user
    user = get_object_or_404(User, id=pk)
    if current_user.is_org_admin or current_user.id == user.id:
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

def createUser(request):
    current_user = request.user
    if not (current_user.is_org_admin):
        return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)
    data = request.data
    serializer = UserSerializer(data=data, context={'request': request})

    try:
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(e)
        return Response({"detail": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
def updateUser(request, pk):
    current_user = request.user
    user = get_object_or_404(User, id=pk)
    if not (current_user.is_org_admin or current_user.id == user.id):
        return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

    data = request.data
    serializer = UserSerializer(instance=user, data=data)

    try:
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(e)
        return Response({"detail": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
def deleteUser(request, pk):
    current_user = request.user
    user = get_object_or_404(User, id=pk)
    if not current_user.is_org_admin:
        return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

    if user.is_org_admin:
        return Response({"detail": "Cannot delete admin users."}, status=status.HTTP_400_BAD_REQUEST)

    user.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

def patchUser(request, pk):
    current_user = request.user
    user = get_object_or_404(User, id=pk)
    if not (current_user.is_org_admin or current_user.id == user.id):
        return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)
    data = request.data
    serializer = UserSerializer(user, data=data, partial=True)
    
    try:
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(e)
        return Response({"detail": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def getAuthUser(request):
    user = request.user
    serializer = UserSerializer(user)
    return Response(serializer.data, status=status.HTTP_200_OK)
    
def handleLogin(request):
    email = request.data.get('email')
    password = request.data.get('password')
    user = authenticate(request, username=email, password=password)

    if user is not None:
        refresh = RefreshToken.for_user(user)
        serializer = UserSerializer(user)
        res = Response({
            'message': 'Logged in successfully',
            'user': serializer.data
        }, status=200)

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

def handleLogout(request):
    res = Response({'message': 'Logged out successfully'}, status=200)
    res.delete_cookie('access')
    res.delete_cookie('refresh')
    return res

def handleRefresh(request):
    refresh_token = request.COOKIES.get('refresh')

    if not refresh_token:
        return Response({'detail': 'Refresh token missing.'}, status=401)

    try:
        refresh = RefreshToken(refresh_token)
        access_token = str(refresh.access_token)

        res = Response({'access': access_token}, status=200)

        res.set_cookie(
            key='access',
            value=access_token,
            httponly=True,
            secure=not settings.DEBUG,
            samesite='Lax',
        )

        return res

    except TokenError:
        return Response({'detail': 'Invalid refresh token.'}, status=401)
