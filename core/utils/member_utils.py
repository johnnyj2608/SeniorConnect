from datetime import datetime, timedelta
from django.db.models import Q
from collections import defaultdict
from rest_framework.response import Response
from ..models.member_model import Member
from ..serializers.member_serializer import (
    MemberSerializer,
    MemberListSerializer,
    MemberBirthdaySerializer
)
import os
from django.conf import settings

def getMemberList(request):
    filter_type = request.GET.get('filter')

    if filter_type == 'home':
        today = datetime.today().date()

        birthday_queries = Q()
        for i in range(7):
            future_day = today + timedelta(days=i)
            birthday_queries |= Q(birth_date__month=future_day.month, birth_date__day=future_day.day)

        members = Member.objects.filter(birthday_queries)

        serializer = MemberBirthdaySerializer(members, many=True)
        sorted_data = sorted(serializer.data, key=lambda x: x['days_until'])
        return Response(sorted_data)

    members = Member.objects.all()
    serializer = MemberListSerializer(members, many=True)

    grouped_members = defaultdict(list)
    for member_data in serializer.data:
        mltc_name = member_data['mltc'] if member_data['mltc'] else "Unknown"
        grouped_members[mltc_name].append(member_data)

    sorted_grouped_members = sorted(grouped_members.items(), key=lambda x: (x[0] == 'Unknown', x[0]))

    data = []
    for mltc, members_list in sorted_grouped_members:
        data.append({
            "name": mltc,
            "member_list": members_list
        })

    return Response(data)

def getMemberDetail(request, pk):
    member = Member.objects.get(id=pk)
    serializer = MemberSerializer(member)
    return Response(serializer.data)

def createMember(request):
    data = request.data
    serializer = MemberSerializer(data=data)

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