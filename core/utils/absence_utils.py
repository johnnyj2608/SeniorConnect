from datetime import datetime
from calendar import monthrange
from django.db.models import Q
from rest_framework.response import Response
from ..models.absence_model import Absence
from ..serializers.absence_serializer import AbsenceSerializer

def getAbsenceList(request):
    year = int(request.GET.get('year'))
    month = int(request.GET.get('month'))

    if month and year:
        start = datetime(year, month, 1)
        end = datetime(year, month, monthrange(year, month)[1])

        absences = Absence.objects.filter(
            Q(start_date__lte=end) & Q(end_date__gte=start)
        )
    else:
        absences = Absence.objects.all()

    serializer = AbsenceSerializer(absences, many=True)
    return Response(serializer.data)

def getAbsenceDetail(request, pk):
    absence = Absence.objects.get(id=pk)
    serializer = AbsenceSerializer(absence)
    return Response(serializer.data)

def createAbsence(request):
    data = request.data
    serializer = AbsenceSerializer(data=data)

    if serializer.is_valid():
        serializer.save()
    else:
        print(serializer.errors)
    return Response(serializer.data)

def updateAbsence(request, pk):
    data = request.data
    absence = Absence.objects.get(id=pk)
    serializer = AbsenceSerializer(instance=absence, data=data)

    if serializer.is_valid():
        serializer.save()
    else:
        print(serializer.errors)
    return Response(serializer.data)

def deleteAbsence(request, pk):
    absence = Absence.objects.get(id=pk)
    absence.delete()
    return Response('Absence was deleted')

def getAbsenceListByMember(request, member_pk):
    absences = Absence.objects.filter(member=member_pk)
    serializer = AbsenceSerializer(absences, many=True)
    return Response(serializer.data)