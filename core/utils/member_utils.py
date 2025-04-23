from rest_framework.response import Response
from ..models.member_model import Member, Language
from ..serializers.member_serializer import MemberSerializer, MemberListSerializer
import os
from django.conf import settings

def getMemberList(request):
    members = Member.objects.all()
    serializer = MemberListSerializer(members, many=True)
    return Response(serializer.data)

def getMemberDetail(request, pk):
    member = Member.objects.get(id=pk)
    serializer = MemberSerializer(member)
    return Response(serializer.data)

def createMember(request):
    serializer = MemberSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    else:
        print(serializer.errors)
        return Response(serializer.errors, status=400)

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

    if member.photo:
        photo_path = member.photo.path
        if os.path.isfile(photo_path):
            os.remove(photo_path)
            
    member.delete()
    return Response('Member was deleted')