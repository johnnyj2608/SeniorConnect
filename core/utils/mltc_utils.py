from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import get_object_or_404
from user.models import User
from ..models.authorization_model import MLTC
from ..serializers.authorization_serializers import MLTCSerializer
from django.db import transaction
import json

def getMLTCList(request):
    mltcs = MLTC.objects.all()

    user = request.user
    if not (user.is_superuser or user.is_org_admin):
        mltcs = mltcs.filter(id__in=user.allowed_mltcs.values_list('id', flat=True))

    serializer = MLTCSerializer(mltcs, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

def getMLTCDetail(request, pk):
    mltc = get_object_or_404(MLTC, id=pk)
    serializer = MLTCSerializer(mltc)
    return Response(serializer.data, status=status.HTTP_200_OK)

@transaction.atomic
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