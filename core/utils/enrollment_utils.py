from rest_framework.response import Response
from ..models.member_model import Member
from ..models.authorization_model import Enrollment
from ..serializers.authorization_serializer import EnrollmentSerializer

def getEnrollmentList(request):
    enrollments = Enrollment.objects.all()
    serializer = EnrollmentSerializer(enrollments, many=True)
    return Response(serializer.data)

def getEnrollmentDetail(request, pk):
    enrollment = Enrollment.objects.get(id=pk)
    serializer = EnrollmentSerializer(enrollment)
    return Response(serializer.data)

def createEnrollment(request):
    data = request.data.copy()
    print(data)
    member_id = data.get('member')
    member = Member.objects.get(id=member_id)
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
    enrollment = Enrollment.objects.get(id=pk)
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
    enrollment = Enrollment.objects.get(id=pk)
    enrollment.delete()
    return Response('Enrollment was deleted')