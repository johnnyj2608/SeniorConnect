from rest_framework.response import Response
from ..models.member_model import Member, Language
from ..serializers.member_serializer import MemberSerializer
import os
from django.conf import settings

def getMemberList(request):
    members = Member.objects.all().order_by('mltc_id', 'sadc_member_id')
    serializer = MemberSerializer(members, many=True)
    return Response(serializer.data)

def getMemberDetail(request, pk):
    member = Member.objects.get(id=pk)
    serializer = MemberSerializer(member)
    return Response(serializer.data)

def createMember(request):
    data = request.data
    
    active = data.get('active', '').lower() == 'true'
    
    member = Member.objects.create(
        sadc_member_id=data['sadc_member_id'],
        photo=data.get('photo', None),
        first_name=data['first_name'],
        last_name=data['last_name'],
        birth_date=data['birth_date'],
        gender=data['gender'],
        # address=data['address'],
        phone=data.get('phone', None),
        email=data.get('email', None),
        medicaid=data.get('medicaid', None),
        language=data.get('language', None),
        ssn=data.get('ssn', None),
        note=data.get('note', None),
        active=active,
    )
    serializer = MemberSerializer(member)
    return Response(serializer.data)

def updateMember(request, pk):
    data = request.data
    member = Member.objects.get(id=pk)
    serializer = MemberSerializer(instance=member, data=data)

    if serializer.is_valid():
        if 'photo' in request.FILES and member.photo:
            old_photo_path = os.path.join(settings.MEDIA_ROOT, str(member.photo))
            if os.path.exists(old_photo_path):
                os.remove(old_photo_path)
        serializer.save()
    else:
        print(serializer.errors)
    return Response(serializer.data)

def deleteMember(request, pk):
    member = Member.objects.get(id=pk)
    member.delete()
    return Response('Member was deleted')