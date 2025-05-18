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