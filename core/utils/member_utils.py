from django.db import transaction
from django.db.models import Q
from datetime import datetime, timedelta
from collections import defaultdict
from rest_framework.response import Response
from ..models.member_model import Member
from ..serializers.member_serializer import (
    MemberSerializer,
    MemberListSerializer,
    MemberBirthdaySerializer
)
from django.utils.text import slugify
from core.utils.supabase import *

def getMemberList(request):
    filter_type = request.GET.get('filter')
    if filter_type == 'birthdays':
        today = datetime.today().date()

        birthday_queries = Q()
        for i in range(7):
            future_day = today + timedelta(days=i)
            birthday_queries |= Q(birth_date__month=future_day.month, birth_date__day=future_day.day)

        members = Member.objects.filter(active=True).filter(birthday_queries)

        serializer = MemberBirthdaySerializer(members, many=True)
        sorted_data = sorted(serializer.data, key=lambda x: x['days_until_birthday'])
        return Response(sorted_data)

    members = Member.objects.all().order_by('active_auth__mltc__name', )
    serializer = MemberListSerializer(members, many=True)

    grouped_members = defaultdict(list)
    for member_data in serializer.data:
        mltc_name = member_data['mltc'] if member_data['mltc'] else "Unknown"
        grouped_members[mltc_name].append(member_data)

    data = []
    for mltc, members_list in grouped_members.items():
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
    public_url = None

    photo = request.FILES.get('photo')
    if 'photo' in data:
        del data['photo']

    try:
        with transaction.atomic():
            serializer = MemberSerializer(data=data)
            
            if serializer.is_valid():
                member = serializer.save()

                if photo:
                    first_name = request.data.get("first_name")
                    last_name = request.data.get("last_name")
                    member_name = slugify(f"{first_name} {last_name}")
                    new_path = f"{member.id}/{member_name}"

                    public_url, error = upload_file_to_supabase(
                        photo, 
                        new_path,
                        member.photo,
                        True
                    )
                    
                    if error:
                        raise Exception(f"Photo upload failed: {error}")

                    member.photo = public_url
                    member.save()
                serializer = MemberSerializer(member)
                return Response(serializer.data)

            else:
                transaction.set_rollback(True)
                raise Exception("Serializer validation failed.")

    except Exception as e:
        if public_url:
            delete_folder_from_supabase(f"{member.id}/")
        return Response({"error": str(e)}, status=500)
    
def updateMember(request, pk):
    data = request.data.copy()
    member = Member.objects.get(id=pk)
    public_url = None

    try:
        with transaction.atomic():

            if 'photo' in request.FILES:
                photo = request.FILES['photo']
                first_name = request.data.get("first_name")
                last_name = request.data.get("last_name")
                member_name = slugify(f"{first_name} {last_name}")
                new_path = f"{member.id}/{member_name}"

                public_url, error = upload_file_to_supabase(
                    photo, 
                    new_path,
                    member.photo,
                    True,
                )

                if error:
                    raise Exception(f"Photo upload failed: {error}")
                
                data['photo'] = public_url

            serializer = MemberSerializer(instance=member, data=data)

            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            else:
                transaction.set_rollback(True)
                raise Exception("Serializer validation failed.")

    except Exception as e:
        if public_url:
            delete_file_from_supabase(public_url)
        return Response({"error": str(e)}, status=500)
    
def updatePartialMember(request, pk):
    member = Member.objects.get(id=pk)
    serializer = MemberSerializer(member, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors)

def deleteMember(request, pk):
    member = Member.objects.get(id=pk)

    if member.photo:
        try:
            delete_folder_from_supabase(f"{member.id}/")
        except Exception as e:
            print(f"Error deleting photo from Supabase: {e}")

    member.delete()
    return Response('Member was deleted')