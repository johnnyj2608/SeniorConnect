from django.utils.timezone import now
from django.db.models import Count, F
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import get_object_or_404
from ..models.member_model import Member
from ..models.authorization_model import Enrollment
from ..serializers.authorization_serializer import EnrollmentSerializer
from .handle_serializer import handle_serializer

def getEnrollmentList(request):
    enrollments = Enrollment.objects.select_related('member', 'old_mltc', 'new_mltc').all()
    paginator = PageNumberPagination()
    result_page = paginator.paginate_queryset(enrollments, request)
    serializer = EnrollmentSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)

def getEnrollmentDetail(request, pk):
    enrollment = get_object_or_404(Enrollment.objects.select_related('member', 'old_mltc', 'new_mltc'), id=pk)
    serializer = EnrollmentSerializer(enrollment)
    return Response(serializer.data, status=status.HTTP_200_OK)

def createEnrollment(request):
    data = request.data.copy()
    member_id = data.get('member')
    member = get_object_or_404(Member, id=member_id)
    if not member.active:
        return Response({"detail": "Member is inactive; no transition performed."}, status=status.HTTP_400_BAD_REQUEST)

    change_date = data.get('change_date')
    if member.enrollment_date is None and change_date:
        member.enrollment_date = change_date

    active_auth_id = data.get('active_auth') or None
    member.active_auth_id = active_auth_id
    member.save()

    old_mltc = data.get('old_mltc')
    new_mltc = data.get('new_mltc')
    if old_mltc == new_mltc:
        return Response(
            {"detail": "Extension, no action required."},
            status=status.HTTP_200_OK
        )

    data['member'] = member.id
    serializer = EnrollmentSerializer(data=data)
    return handle_serializer(serializer, success_status=status.HTTP_201_CREATED)

def updateEnrollment(request, pk):
    data = request.data
    enrollment = get_object_or_404(Enrollment.objects.select_related('member', 'old_mltc', 'new_mltc'), id=pk)
    serializer = EnrollmentSerializer(instance=enrollment, data=data)
    return handle_serializer(serializer, success_status=status.HTTP_200_OK)

def deleteEnrollment(request, pk):
    enrollment = get_object_or_404(Enrollment, id=pk)
    enrollment.delete()
    return Response({"detail": "Enrollment was deleted."},status=status.HTTP_204_NO_CONTENT)

def getCurrentMonthEnrollmentStats(request):
    today = now()
    current_year = today.year
    current_month = today.month

    enrollments = Enrollment.objects.filter(
        change_date__year=current_year,
        change_date__month=current_month,
    )

    enroll_count = (
        enrollments
        .filter(new_mltc__isnull=False)
        .values(name=F('new_mltc__name'))
        .annotate(count=Count('new_mltc'))
    )

    disenroll_count = (
        enrollments
        .filter(old_mltc__isnull=False)
        .values(name=F('old_mltc__name'))
        .annotate(count=Count('old_mltc'))
    )

    enroll_map = {e['name']: e['count'] for e in enroll_count}
    disenroll_map = {d['name']: d['count'] for d in disenroll_count}

    all_mltcs = set(enroll_map) | set(disenroll_map)

    flat_data = {
        mltc: enroll_map.get(mltc, 0) - disenroll_map.get(mltc, 0)
        for mltc in all_mltcs
    }

    flat_data['Overall'] = sum(flat_data.values())
    print(flat_data)
    return Response(flat_data, status=status.HTTP_200_OK)