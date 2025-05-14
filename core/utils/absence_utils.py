from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from ..models.absence_model import Absence
from ..serializers.absence_serializer import AbsenceSerializer

def getAbsenceList(request):
    absences = Absence.objects.all()
    paginator = PageNumberPagination()
    result_page = paginator.paginate_queryset(absences, request)
    serializer = AbsenceSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)

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