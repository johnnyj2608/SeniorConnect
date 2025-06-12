from django.db import transaction
from django.db.models import Count, Q
from datetime import timedelta
from django.utils import timezone
from collections import defaultdict
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import get_object_or_404
from ..models.member_model import Member
from ..models.authorization_model import MLTC
from ..serializers.member_serializers import (
    MemberSerializer,
    MemberListSerializer,
    MemberBirthdaySerializer
)
from ..serializers.absence_serializers import Absence, AbsenceSerializer
from ..serializers.authorization_serializers import AuthorizationWithServiceSerializer
from ..serializers.contact_serializers import Contact, ContactSerializer
from ..serializers.file_serializers import File, FileSerializer
from django.utils.text import slugify
from core.utils.supabase import (
    upload_file_to_supabase,
    delete_file_from_supabase,
    delete_folder_from_supabase
)

def getMemberList(request):
    user = request.user
    members = Member.objects.select_related('active_auth', 'active_auth__mltc').accessible_by(user)

    filter_param = request.GET.get('filter')
    if filter_param == "unknown":
        members = members.filter(active_auth__mltc__isnull=True)
    elif filter_param:
        members = members.filter(active_auth__mltc__name__iexact=filter_param)

    show_inactive = request.GET.get('show_inactive', 'false').lower() == 'true'
    if not show_inactive:
        members = members.filter(active=True)

    members = members.order_by('active_auth__mltc__name')
    serializer = MemberListSerializer(members, many=True)

    data = defaultdict(list)
    for member_data in serializer.data:
        mltc_name = member_data['mltc'] if member_data.get('mltc') else "unknown"
        data[mltc_name].append(member_data)

    return Response(data, status=status.HTTP_200_OK)

def getMemberDetail(request, pk):
    member = get_object_or_404(Member.objects.select_related('language', 'active_auth', 'active_auth__mltc'), id=pk)
    serializer = MemberSerializer(member)
    return Response(serializer.data, status=status.HTTP_200_OK)

@transaction.atomic
def createMember(request):
    data = request.data.copy()
    public_url = None

    photo = request.FILES.get('photo')
    if 'photo' in data:
        del data['photo']

    try:
        serializer = MemberSerializer(data=data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
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
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        if public_url:
            delete_folder_from_supabase(f"{member.id}/")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@transaction.atomic
def updateMember(request, pk):
    data = request.data.copy()
    member = get_object_or_404(Member.objects.select_related('language', 'active_auth', 'active_auth__mltc'), id=pk)
    public_url = None

    try:
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

        elif data.get('photo') == '' and member.photo:
            delete_file_from_supabase(member.photo)
            data['photo'] = None

        serializer = MemberSerializer(instance=member, data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        print(e)
        if public_url:
            delete_file_from_supabase(public_url)
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
def getActiveAuth(request, pk):
    member = get_object_or_404(Member.objects.select_related('active_auth', 'active_auth__mltc'), id=pk)
    if member.active_auth:
        serializer = AuthorizationWithServiceSerializer(member.active_auth)
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

def getUpcomingBirthdays(request):
    today = timezone.now().date()

    birthday_queries = Q()
    for i in range(7):
        future_day = today + timedelta(days=i)
        birthday_queries |= Q(birth_date__month=future_day.month, birth_date__day=future_day.day)

    members = Member.objects.filter(active=True).filter(birthday_queries)

    serializer = MemberBirthdaySerializer(members, many=True)
    sorted_data = sorted(serializer.data, key=lambda x: x['days_until'])[:20]
    return Response(sorted_data, status=status.HTTP_200_OK)

def toggleMemberStatus(request, pk):
    member = get_object_or_404(Member, id=pk)
    member.active = not member.active
    member.save()
    return Response({"active": member.active}, status=status.HTTP_200_OK)

def getMemberProfile(request, pk):
    user = request.user
    
    try:
        member = (
            Member.objects
            .select_related('language', 'active_auth', 'active_auth__mltc')
            .accessible_by(user)
            .get(id=pk)
        )
    except Member.DoesNotExist:
        return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)


    absences = Absence.objects.filter(member=pk)
    contacts = Contact.objects.prefetch_related('members').filter(members__id=pk)
    files = File.objects.filter(member=pk)

    return Response({
        'info': MemberSerializer(member).data,
        'auth': AuthorizationWithServiceSerializer(member.active_auth).data if member.active_auth else None,
        'absences': AbsenceSerializer(absences, many=True).data,
        'contacts': ContactSerializer(contacts, many=True).data,
        'files': FileSerializer(files, many=True).data
    }, status=status.HTTP_200_OK)