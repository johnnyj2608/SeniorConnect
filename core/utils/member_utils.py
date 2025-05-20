from django.db import transaction
from django.db.models import Count, F, Q
from datetime import datetime, timedelta
from collections import defaultdict
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import get_object_or_404
from ..models.member_model import Member
from ..models.authorization_model import MLTC
from ..serializers.member_serializer import (
    MemberSerializer,
    MemberListSerializer,
    MemberBirthdaySerializer
)
from ..serializers.authorization_serializer import AuthorizationSerializer
from django.utils.text import slugify
from core.utils.supabase import *
from .handle_serializer import handle_serializer

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
        return Response(sorted_data, status=status.HTTP_200_OK)

    members = Member.objects.all().select_related('active_auth', 'active_auth__mltc').order_by('active_auth__mltc__name')
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

    return Response(data, status=status.HTTP_200_OK)

def getMemberDetail(request, pk):
    member = get_object_or_404(Member.objects.select_related('language', 'active_auth', 'active_auth__mltc'), id=pk)
    serializer = MemberSerializer(member)
    return Response(serializer.data, status=status.HTTP_200_OK)

def createMember(request):
    data = request.data.copy()
    public_url = None

    photo = request.FILES.get('photo')
    if 'photo' in data:
        del data['photo']

    try:
        with transaction.atomic():
            serializer = MemberSerializer(data=data)
            response = handle_serializer(serializer, success_status=status.HTTP_201_CREATED)

            if response.status_code >= 400:
                raise Exception("Serializer validation failed.")
            
            member = serializer.instance

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
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            
            return response

    except Exception as e:
        if public_url:
            delete_folder_from_supabase(f"{member.id}/")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
def updateMember(request, pk):
    data = request.data.copy()
    member = get_object_or_404(Member.objects.select_related('language', 'active_auth', 'active_auth__mltc'), id=pk)
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
            response = handle_serializer(serializer, success_status=status.HTTP_200_OK)

            if response.status_code >= 400:
                raise Exception("Serializer validation failed.")

            return response

    except Exception as e:
        if public_url:
            delete_file_from_supabase(public_url)
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
def getActiveAuth(request, pk):
    member = get_object_or_404(Member.objects.select_related('active_auth', 'active_auth__mltc'), id=pk)
    if member.active_auth:
        serializer = AuthorizationSerializer(member.active_auth)
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response({}, status=status.HTTP_200_OK)

def deleteMember(request, pk):
    member = get_object_or_404(Member, id=pk)

    if member.photo:
        try:
            delete_folder_from_supabase(f"{member.id}/")
        except Exception as e:
            print(f"Error deleting photo from Supabase: {e}")

    member.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

def getActiveMemberStats(request):
    active_count = Member.objects.filter(active=True, active_auth__isnull=False).count()

    try:
        mltc_counts = (
            MLTC.objects
            .annotate(
                count=Count(
                    'authorization__member',
                    filter=Q(
                        authorization__active=True,
                        authorization__member__active=True,
                    ),
                    distinct=True,
                )
            )
            .values('name', 'count')
            .order_by('name')
        )
    except Exception as e:
        print('Exception in query:', e)
        mltc_counts = []

    return Response({
        "active_count": active_count,
        "mltc_count": list(mltc_counts),
    }, status=status.HTTP_200_OK)