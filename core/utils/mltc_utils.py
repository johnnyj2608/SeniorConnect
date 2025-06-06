from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import get_object_or_404
from ..models.authorization_model import MLTC
from ..serializers.authorization_serializers import MLTCSerializer
import json

def getMLTCList(request):
    mltcs = MLTC.objects.all()
    serializer = MLTCSerializer(mltcs, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

def getMLTCDetail(request, pk):
    mltc = get_object_or_404(MLTC, id=pk)
    serializer = MLTCSerializer(mltc)
    return Response(serializer.data, status=status.HTTP_200_OK)

def createMLTC(request):
    data = request.data.copy()
    
    dx_codes = data.get('dx_codes', '').split(',')
    data['dx_codes'] = json.dumps([code for code in dx_codes if code != ''])

    serializer = MLTCSerializer(data=data)
    
    try:
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(e)
        return Response({"detail": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def updateMLTC(request, pk):
    data = request.data
    mltc = get_object_or_404(MLTC, id=pk)
    serializer = MLTCSerializer(instance=mltc, data=data)
    
    try:
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(e)
        return Response({"detail": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def deleteMLTC(request, pk):
    mltc = get_object_or_404(MLTC, id=pk)
    mltc.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)