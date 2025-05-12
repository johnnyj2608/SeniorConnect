from django.db import transaction
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
from django.conf import settings
from core.utils.supabase import *

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
    data = request.data.copy()
    serializer = MemberSerializer(data=data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    else:
        print(serializer.errors)
        return Response(serializer.errors, status=400)
    
def updateMember(request, pk):
    data = request.data.copy()
    member = Member.objects.get(id=pk)

    try:
        with transaction.atomic():

            if 'photo' in request.FILES:
                photo = request.FILES['photo']
                file_name = f"{member.first_name}_{member.last_name}_profile.{photo.name.split('.')[-1]}"
                file_path = f"{member.id}/{file_name}"

                public_url, error = upload_file_to_supabase(photo, file_path, 'photo')

                if error:
                    raise Exception(f"Photo upload failed: {error}")
                
                data['photo'] = public_url

            serializer = MemberSerializer(instance=member, data=data)

            if serializer.is_valid():
                member = serializer.save()

                return Response(MemberSerializer(member).data)
            else:
                raise Exception("Serializer validation failed.")

    except Exception as e:
        if 'photo' in data:
            file_path = f"{member.id}/{member.first_name}_{member.last_name}_profile"
            delete_photo_from_supabase(file_path)

        return Response({"error": str(e)}, status=500)

def deleteMember(request, pk):
    member = Member.objects.get(id=pk)

    if member.photo:
        try:
            delete_folder_from_supabase(f"{member.id}/")
        except Exception as e:
            print(f"Error deleting photo from Supabase: {e}")

    member.delete()
    return Response('Member was deleted')