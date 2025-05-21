from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import get_object_or_404
from .models import User
from .serializers import UserSerializer

def getUserList(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

def createUser(request):
    data = request.data
    serializer = UserSerializer(data=data)
    if serializer.is_valid():
        try:
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(e)
            return Response({"detail": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    else:
        print("Serializer error:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def getUserDetail(request, pk):
    current_user = request.user
    user = get_object_or_404(User, id=pk)
    if current_user.is_admin or current_user.id == user.id:
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

def updateUser(request, pk):
    current_user = request.user
    user = get_object_or_404(User, id=pk)
    if not (current_user.is_admin or current_user.id == user.id):
        return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

    data = request.data
    serializer = UserSerializer(instance=user, data=data)
    if serializer.is_valid():
        try:
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            print(e)
            return Response({"detail": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    else:
        print("Serializer error:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def deleteUser(request, pk):
    current_user = request.user
    user = get_object_or_404(User, id=pk)
    if not current_user.is_admin:
        return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

    user.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
