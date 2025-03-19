from rest_framework.response import Response
from ..models.member_model import Member
from ..serializers.member_serializer import MemberSerializer

def getMemberList(request):
    members = Member.objects.all().order_by('-updated')
    serializer = MemberSerializer(members, many=True)
    return Response(serializer.data)

def getMemberDetail(request, pk):
    member = Member.objects.get(id=pk)
    serializer = MemberSerializer(member)
    return Response(serializer.data)

def createMember(request):
    data = request.data
    member = Member.objects.create(
        sadc_member_id=data['sadc_member_id'],
        mltc_id=data['mltc'],
        first_name=data['first_name'],
        last_name=data['last_name'],
        birth_date=data['birth_date'],
        gender=data['gender'],
        address_id=data['address'],
        phone=data['phone'],
        email=data.get('email', None),
        medicaid=data['medicaid'],
        care_manager_id=data.get('care_manager', None),
        primary_care_provider_id=data.get('primary_care_provider', None),
        pharmacy_id=data.get('pharmacy', None),
        spouse_id=data.get('spouse', None),
    )
    serializer = MemberSerializer(member)
    return Response(serializer.data)

def updateMember(request, pk):
    data = request.data
    member = Member.objects.get(id=pk)
    serializer = MemberSerializer(instance=member, data=data)

    if serializer.is_valid():
        serializer.save()
    return Response(serializer.data)

def deleteMember(request, pk):
    member = Member.objects.get(id=pk)
    member.delete()
    return Response('Member was deleted')