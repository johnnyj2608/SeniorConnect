from rest_framework.response import Response
from ..models.absence_model import Absence
from ..models.member_model import Member
from ..serializers.absence_serializer import AbsenceSerializer

def getAbsenceList(request):
    absences = Absence.objects.all()
    serializer = AbsenceSerializer(absences, many=True)
    return Response(serializer.data)

def getAbsenceDetail(request, pk):
    absence = Absence.objects.get(id=pk)
    serializer = AbsenceSerializer(absence)
    return Response(serializer.data)

def createAbsence(request):
    data = request.data

    member = Member.objects.get(id=data['member'])

    absence = Absence.objects.create(
        member=member,
        absence_type=data.get('absence_type', ''),
        start_date=data.get('start_date'),
        end_date=data.get('end_date'),
        notes=data.get('notes', '')
    )
    serializer = AbsenceSerializer(absence)
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