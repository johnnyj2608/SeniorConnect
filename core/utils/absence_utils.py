from datetime import timedelta
from django.utils import timezone
from django.db.models import Q
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from ..models.absence_model import Absence
from ..serializers.absence_serializers import (
    AbsenceSerializer, 
    AbsenceUpcomingSerializer, 
    AssessmentSerializer
)

def getAbsenceList(request):
    absences = (
        Absence.objects
        .select_related('member')
        .exclude(absence_type='assessment')
        .all()
    )
    filter_param = request.GET.get('filter')
    now = timezone.now().date()

    if filter_param == 'ongoing':
        absences = absences.filter(
            Q(start_date__lte=now, end_date__isnull=True) |
            Q(start_date__lte=now, end_date__gte=now)
        )
    elif filter_param == 'upcoming':
        absences = absences.filter(start_date__gt=now)
    elif filter_param == 'completed':
        absences = absences.filter(end_date__lt=now)

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

    try:
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(e)
        return Response({"detail": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def updateAbsence(request, pk):
    data = request.data
    absence = get_object_or_404(Absence.objects.select_related('member'), id=pk)
    serializer = AbsenceSerializer(instance=absence, data=data)

    try:
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(e)
        return Response({"detail": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def deleteAbsence(request, pk):
    absence = get_object_or_404(Absence, id=pk)
    absence.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

def getAbsenceListByMember(request, member_pk):
    absences = Absence.objects.select_related('member').filter(member=member_pk)
    serializer = AbsenceSerializer(absences, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

def getUpcomingAbsences(request):
    today = timezone.now().date()
    in_7_days = today + timedelta(days=7)

    leaving = (
        Absence.objects.filter(
            start_date__range=(today, in_7_days),
            member__isnull=False
        )
        .exclude(absence_type='assessment')
        .select_related('member')[:20]
    )

    returning = (
        Absence.objects.filter(
            end_date__range=(today, in_7_days),
            member__isnull=False
        )
        .exclude(absence_type='assessment')
        .exclude(pk__in=leaving.values_list('pk', flat=True))
        .select_related('member')[:20]
    )

    leaving_serialized = AbsenceUpcomingSerializer(leaving, many=True).data
    returning_serialized = AbsenceUpcomingSerializer(returning, many=True).data

    return Response({
        "leaving": leaving_serialized,
        "returning": returning_serialized,
    }, status=status.HTTP_200_OK)

def getAssessmentList(request):
    assessments = (
        Absence.objects
        .filter(absence_type='assessment')
        .select_related('member')
    )

    paginator = PageNumberPagination()
    result_page = paginator.paginate_queryset(assessments, request)
    serializer = AssessmentSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)

def getUpcomingAssessments(request):
    today = timezone.now().date()
    in_7_days = today + timedelta(days=7)

    assessments = (
        Absence.objects
        .filter(
            absence_type='assessment',
            start_date__range=(today, in_7_days),
            member__isnull=False
        )
        .select_related('member')[:20]
    )

    serializer = AssessmentSerializer(assessments, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)