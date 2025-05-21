from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import get_object_or_404
from .models import StaffUser
from .serializers import StaffUserSerializer

def getStaffUserList(request):
    users = StaffUser.objects.all()
    serializer = StaffUserSerializer(users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

def getStaffUserDetail(request, pk):
    user = get_object_or_404(StaffUser, id=pk)
    serializer = StaffUserSerializer(user)
    return Response(serializer.data, status=status.HTTP_200_OK)

def createStaffUser(request):
    data = request.data
    serializer = StaffUserSerializer(data=data)
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

def updateStaffUser(request, pk):
    data = request.data
    user = get_object_or_404(StaffUser, id=pk)
    serializer = StaffUserSerializer(instance=user, data=data)
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

def deleteStaffUser(request, pk):
    user = get_object_or_404(StaffUser, id=pk)
    user.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)