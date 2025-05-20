from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import get_object_or_404
from ..models.authorization_model import MLTC
from ..serializers.authorization_serializer import MLTCSerializer
from .handle_serializer import handle_serializer

def getMLTCList(request):
    mltcs = MLTC.objects.all()
    serializer = MLTCSerializer(mltcs, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

def getMLTCDetail(request, pk):
    mltc = get_object_or_404(MLTC, id=pk)
    serializer = MLTCSerializer(mltc)
    return Response(serializer.data, status=status.HTTP_200_OK)

def createMLTC(request):
    data = request.data
    serializer = MLTCSerializer(data=data)
    return handle_serializer(serializer, success_status=status.HTTP_201_CREATED)

def updateMLTC(request, pk):
    data = request.data
    mltc = get_object_or_404(MLTC, id=pk)
    serializer = MLTCSerializer(instance=mltc, data=data)
    return handle_serializer(serializer, success_status=status.HTTP_200_OK)

def deleteMLTC(request, pk):
    mltc = get_object_or_404(MLTC, id=pk)
    mltc.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)