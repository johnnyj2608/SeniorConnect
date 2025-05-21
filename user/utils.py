from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import get_object_or_404
from .models import User
from .serializers import UserSerializer

def getUserList(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

def getUserDetail(request, pk):
    user = get_object_or_404(User, id=pk)
    serializer = UserSerializer(user)
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
            return Response(
                {"detail": "Internal server error."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    else:
        print("Serializer error:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def updateUser(request, pk):
    data = request.data
    user = get_object_or_404(User, id=pk)
    serializer = UserSerializer(instance=user, data=data)
    if serializer.is_valid():
        try:
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            print(e)
            return Response(
                {"detail": "Internal server error."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    else:
        print("Serializer error:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def deleteUser(request, pk):
    user = get_object_or_404(User, id=pk)
    user.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)