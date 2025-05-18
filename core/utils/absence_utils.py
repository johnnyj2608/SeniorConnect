from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from ..models.absence_model import Absence
from ..serializers.absence_serializer import AbsenceSerializer
from .handle_serializer import handle_serializer

def getAbsenceList(request):
    absences = Absence.objects.select_related('member').all()
    paginator = PageNumberPagination()
    result_page = paginator.paginate_queryset(absences, request)
    serializer = AbsenceSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)

def getAbsenceDetail(request, pk):
    absence = get_object_or_404(Absence.objects.select_related('member'), id=pk)
    serializer = AbsenceSerializer(absence)
    return Response(serializer.data, status=status.HTTP_200_OK)

def createAbsence(request):
    data = request.data
    serializer = AbsenceSerializer(data=data)
    return handle_serializer(serializer, success_status=status.HTTP_201_CREATED)

def updateAbsence(request, pk):
    data = request.data
    absence = get_object_or_404(Absence.objects.select_related('member'), id=pk)
    serializer = AbsenceSerializer(instance=absence, data=data)
    return handle_serializer(serializer, success_status=status.HTTP_200_OK)

def deleteAbsence(request, pk):
    absence = get_object_or_404(Absence, id=pk)
    absence.delete()
    return Response({'detail': 'Absence was deleted'}, status=status.HTTP_204_NO_CONTENT)

def getAbsenceListByMember(request, member_pk):
    absences = Absence.objects.select_related('member').filter(member=member_pk)
    serializer = AbsenceSerializer(absences, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)