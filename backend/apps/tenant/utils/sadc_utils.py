from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import get_object_or_404
from ...tenant.models.sadc_model import Sadc
from ...tenant.serializers.sadc_serializers import SadcSerializer

def getSadcDetail(request):
    sadc = get_object_or_404(Sadc, id=request.user.sadc.id)
    serializer = SadcSerializer(sadc)
    return Response(serializer.data, status=status.HTTP_200_OK)

def updateSadc(request):
    data = request.data
    sadc = get_object_or_404(Sadc, id=request.user.sadc.id)
    serializer = SadcSerializer(instance=sadc, data=data)
    
    try:
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(e)
        return Response({"detail": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)