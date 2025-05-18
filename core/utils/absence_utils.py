from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from ..models.absence_model import Absence
from ..serializers.absence_serializer import AbsenceSerializer

def getAbsenceList(request):
    absences = Absence.objects.select_related('member').all()
    paginator = PageNumberPagination()
    result_page = paginator.paginate_queryset(absences, request)
    serializer = AbsenceSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)

def getAbsenceDetail(request, pk):
    absence = get_object_or_404(Absence.objects.select_related('member'), id=pk)
    serializer = AbsenceSerializer(absence)
    return Response(serializer.data)

def createAbsence(request):
    data = request.data
    serializer = AbsenceSerializer(data=data)

    if serializer.is_valid():
        try:
            serializer.save()
        except Exception as e:
            print(e)
    else:
        print("Serializer error:", serializer.errors)
        return Response(serializer.errors, status=400)
    return Response(serializer.data)

def updateAbsence(request, pk):
    data = request.data
    absence = get_object_or_404(Absence.objects.select_related('member'), id=pk)
    serializer = AbsenceSerializer(instance=absence, data=data)

    if serializer.is_valid():
        try:
            serializer.save()
        except Exception as e:
            print(e)
    else:
        print("Serializer error:", serializer.errors)
        return Response(serializer.errors, status=400)
    return Response(serializer.data)

def deleteAbsence(request, pk):
    absence = get_object_or_404(Absence, id=pk)
    absence.delete()
    return Response('Absence was deleted')

def getAbsenceListByMember(request, member_pk):
    absences = Absence.objects.select_related('member').filter(member=member_pk)
    serializer = AbsenceSerializer(absences, many=True)
    return Response(serializer.data)