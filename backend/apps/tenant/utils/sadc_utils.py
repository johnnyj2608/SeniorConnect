from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import get_object_or_404
from ...tenant.models.sadc_model import Sadc
from ...tenant.serializers.sadc_serializers import SadcSerializer

def getSadcDetail(request):
    sadc = get_object_or_404(Sadc, id=request.user.sadc.id)
    serializer = SadcSerializer(sadc)
    return Response(serializer.data, status=status.HTTP_200_OK)

def updateSadcAttendanceTemplate(request):
    sadc = get_object_or_404(Sadc, id=request.user.sadc.id)
    attendance_template = request.data.get('attendance_template')

    if attendance_template is None:
        return Response({"error": "attendance_template is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    sadc.attendance_template = attendance_template
    sadc.save()

    return Response({"attendance_template": sadc.attendance_template}, status=status.HTTP_200_OK)