from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import get_object_or_404
from django.contrib.auth import authenticate
from django.conf import settings
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from rest_framework_simplejwt.tokens import RefreshToken, TokenError

from .models import User
from .serializers import UserReadSerializer, UserWriteSerializer, PasswordSerializer
from backend.utils.email_utils import sendEmailInvitation
from backend.access.ownership_access import require_sadc_ownership, require_org_admin, require_self_or_admin

def getUserList(request):
    users = User.objects.filter(sadc=request.user.sadc)
    serializer = UserReadSerializer(users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

def getUserDetail(request, pk):
    current_user = request.user
    user = get_object_or_404(User, id=pk)

    unauthorized = require_sadc_ownership(user, current_user) or require_self_or_admin(user, current_user)
    if unauthorized: return unauthorized

    serializer = UserReadSerializer(user)
    return Response(serializer.data, status=status.HTTP_200_OK)

def createUser(request):
    current_user = request.user
    unauthorized = require_org_admin(current_user)
    if unauthorized: return unauthorized

    serializer = UserWriteSerializer(data=request.data, context={'request': request})

    try:
        if serializer.is_valid():
            user = serializer.save()
            sendEmailInvitation(user, request)
            read_serializer = UserReadSerializer(user)
            return Response(read_serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print("CREATE USER ERROR:", e)
        return Response({"detail": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def updateUser(request, pk):
    current_user = request.user
    user = get_object_or_404(User, id=pk)

    unauthorized = require_sadc_ownership(user, current_user) or require_self_or_admin(user, current_user)
    if unauthorized: return unauthorized

    serializer = UserWriteSerializer(instance=user, data=request.data)

    try:
        if serializer.is_valid():
            user = serializer.save()
            read_serializer = UserReadSerializer(user)
            return Response(read_serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print("UPDATE USER ERROR:", e)
        return Response({"detail": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def patchUser(request, pk):
    current_user = request.user
    user = get_object_or_404(User, id=pk)

    unauthorized = require_sadc_ownership(user, current_user) or require_self_or_admin(user, current_user)
    if unauthorized: return unauthorized

    serializer = UserWriteSerializer(user, data=request.data, partial=True)

    try:
        if serializer.is_valid():
            user = serializer.save()
            read_serializer = UserReadSerializer(user)
            return Response(read_serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print("PATCH USER ERROR:", e)
        return Response({"detail": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def deleteUser(request, pk):
    current_user = request.user
    user = get_object_or_404(User, id=pk)

    unauthorized = require_sadc_ownership(user, current_user) or require_org_admin(current_user)
    if unauthorized: return unauthorized

    if user.is_org_admin:
        return Response({"detail": "Cannot delete admin users."}, status=status.HTTP_400_BAD_REQUEST)

    user.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

def setPassword(request, uidb64, token):
    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        user = User.objects.get(pk=uid)
    except (User.DoesNotExist, ValueError, TypeError):
        return Response({'detail': 'Invalid link.'}, status=status.HTTP_400_BAD_REQUEST)

    if not default_token_generator.check_token(user, token):
        return Response({'detail': 'Token expired or invalid.'}, status=status.HTTP_400_BAD_REQUEST)

    serializer = PasswordSerializer(data=request.data)
    if serializer.is_valid():
        user.set_password(serializer.validated_data['password'])
        user.save()
        return Response({'message': 'Password set successfully.'}, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def getAuthUser(request):
    user = request.user
    serializer = UserReadSerializer(user)
    return Response(serializer.data, status=status.HTTP_200_OK)

def handleLogin(request):
    try:
        email = request.data.get('email')
        password = request.data.get('password')
        user = authenticate(request, username=email, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)
            serializer = UserReadSerializer(user)
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
    except Exception as e:
        print("LOGIN ERROR:", e)
        return Response({'detail': str(e)}, status=500)

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
