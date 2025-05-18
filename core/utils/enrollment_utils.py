from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.generics import get_object_or_404
from ..models.member_model import Member
from ..models.authorization_model import Enrollment
from ..serializers.authorization_serializer import EnrollmentSerializer

def getEnrollmentList(request):
    enrollments = Enrollment.objects.select_related('member', 'old_mltc', 'new_mltc').all()
    paginator = PageNumberPagination()
    result_page = paginator.paginate_queryset(enrollments, request)
    serializer = EnrollmentSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)

def getEnrollmentDetail(request, pk):
    enrollment = get_object_or_404(Enrollment.objects.select_related('member', 'old_mltc', 'new_mltc'), id=pk)
    serializer = EnrollmentSerializer(enrollment)
    return Response(serializer.data)

def createEnrollment(request):
    data = request.data.copy()
    member_id = data.get('member')
    member = get_object_or_404(Member, id=member_id)
    if not member.active:
        return Response({"detail": "Member is inactive; no transition performed."})

    start_date = data.get('start_date')
    if member.enrollment_date is None and start_date:
        member.enrollment_date = start_date

    active_auth_id = data.get('active_auth') or None
    member.active_auth_id = active_auth_id
    member.save()

    old_mltc = data.get('old_mltc')
    new_mltc = data.get('new_mltc')
    if old_mltc == new_mltc:
        return Response({"detail": "Extension, no action required"})

    data['member'] = member.id
    serializer = EnrollmentSerializer(data=data)
    if serializer.is_valid():
        try:
            serializer.save()
        except Exception as e:
            print(e)
    else:
        print("Serializer error:", serializer.errors)
        return Response(serializer.errors, status=400)
    return Response(serializer.data)

def updateEnrollment(request, pk):
    data = request.data
    enrollment = get_object_or_404(Enrollment.objects.select_related('member', 'old_mltc', 'new_mltc'), id=pk)
    serializer = EnrollmentSerializer(instance=enrollment, data=data)

    if serializer.is_valid():
        try:
            serializer.save()
        except Exception as e:
            print(e)
    else:
        print("Serializer error:", serializer.errors)
        return Response(serializer.errors, status=400)
    return Response(serializer.data)

def deleteEnrollment(request, pk):
    enrollment = get_object_or_404(Enrollment, id=pk)
    enrollment.delete()
    return Response('Enrollment was deleted')