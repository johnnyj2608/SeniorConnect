from django.db import transaction
from django.db.models import Count, Q
from datetime import timedelta
from django.http import HttpResponse
from django.utils import timezone
from collections import defaultdict
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import get_object_or_404

from ..models.member_model import Member
from ..models.authorization_model import Authorization
from ...tenant.models.mltc_model import Mltc
from ..serializers.member_serializers import (
    MemberSerializer,
    MemberListSerializer,
    MemberBirthdaySerializer,
    MemberDeletedSerializer,
)
from ..serializers.absence_serializers import Absence, AbsenceSerializer
from ..serializers.authorization_serializers import AuthorizationWithServiceSerializer, AuthorizationSerializer
from ..serializers.contact_serializers import Contact, ContactSerializer
from ..serializers.file_serializers import File, FileSerializer
from django.utils.text import slugify
from .supabase import (
    upload_file_to_supabase,
    delete_file_from_supabase,
    delete_folder_from_supabase
)
from ..access import member_access_filter, member_access_pk
import csv

@member_access_filter()
def getMemberList(request):
    members = (
        request.accessible_members_qs
        .select_related('active_auth', 'active_auth__mltc')
        .order_by('active_auth__mltc__name', 'sadc_member_id')
    )
    serializer = MemberListSerializer(members, many=True)

    data = defaultdict(list)
    for member_data in serializer.data:
        mltc_name = member_data['mltc_name'] if member_data.get('mltc_name') else "unknown"
        data[mltc_name].append(member_data)

    return Response(data, status=status.HTTP_200_OK)

@member_access_pk
def getMemberDetail(request, pk):
    member = get_object_or_404(Member, id=pk)
    serializer = MemberSerializer(member)
    return Response(serializer.data, status=status.HTTP_200_OK)

@transaction.atomic
def createMember(request):
    data = request.data.copy()
    public_url = None
    data['sadc'] = request.user.sadc.id

    photo = request.FILES.get('photo')
    if 'photo' in data:
        del data['photo']

    try:
        serializer = MemberSerializer(data=data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        member = serializer.save()

        if photo:
            first_name = data.get("first_name", "")
            last_name = data.get("last_name", "")
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
        if public_url and 'member' in locals():
            delete_folder_from_supabase(f"{member.id}/")
        return Response({"detail": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@member_access_pk
@transaction.atomic
def updateMember(request, pk):
    data = request.data.copy()
    member = get_object_or_404(Member.objects.select_related('active_auth', 'active_auth__mltc'), id=pk)
    public_url = None
    sadc = request.user.sadc
    data['sadc'] = sadc.id

    try:
        if 'photo' in request.FILES:
            photo = request.FILES['photo']
            first_name = data.get("first_name")
            last_name = data.get("last_name")
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

        serializer = MemberSerializer(instance=member, data=data, context={'sadc': sadc})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        print(e)
        if public_url:
            delete_file_from_supabase(public_url)
        return Response({"detail": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@member_access_pk
def getActiveAuth(request, pk):
    member = get_object_or_404(Member.objects.select_related('active_auth', 'active_auth__mltc'), id=pk)
    if member.active_auth:
        serializer = AuthorizationWithServiceSerializer(member.active_auth)
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response({}, status=status.HTTP_200_OK)

@member_access_pk
def deleteMember(request, pk):
    member = get_object_or_404(Member, id=pk)
    member.soft_delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

@member_access_pk
def restoreMember(request, pk):
    member = get_object_or_404(Member, id=pk, deleted_at__isnull=False)
    member.restore()
    return Response({"detail": "Member restored."}, status=status.HTTP_200_OK)

@member_access_filter(include_deleted=True)
def getDeletedMembers(request):
    members = (
        request.accessible_members_qs
        .filter(deleted_at__isnull=False)
        .select_related('active_auth', 'active_auth__mltc')
        .order_by('deleted_at')
    )
    serializer = MemberDeletedSerializer(members, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@member_access_filter()
def getActiveMemberStats(request):
    user = request.user
    accessible_members = request.accessible_members_qs
    allowed_mltcs = user.allowed_mltcs.all()

    active_count = accessible_members.filter(active=True, active_auth__isnull=False).count()

    try:
        mltc_counts = (
            Mltc.objects
            .filter(id__in=allowed_mltcs)
            .annotate(
                count=Count(
                    'authorization__member',
                    filter=Q(
                        authorization__active=True,
                        authorization__member__active=True,
                        authorization__member__in=accessible_members
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

@member_access_filter()
def getUpcomingBirthdays(request):
    today = timezone.now().date()

    birthday_queries = Q()
    for i in range(7):
        future_day = today + timedelta(days=i)
        birthday_queries |= Q(birth_date__month=future_day.month, birth_date__day=future_day.day)

    members = (
        request.accessible_members_qs
        .filter(active=True)
        .filter(birthday_queries)
    )

    serializer = MemberBirthdaySerializer(members, many=True)
    sorted_data = sorted(serializer.data, key=lambda x: x['days_until'])[:20]
    return Response(sorted_data, status=status.HTTP_200_OK)

@member_access_pk
def toggleMemberStatus(request, pk):
    member = get_object_or_404(Member, id=pk)
    member.toggle_active()
    return Response({"active": member.active}, status=status.HTTP_200_OK)

@member_access_pk
def getMemberProfile(request, pk):
    member = get_object_or_404(Member.objects.select_related('active_auth', 'active_auth__mltc'), id=pk)

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

@member_access_filter()
def exportMembersCsv(request):
    members = request.accessible_members_qs.select_related('active_auth', 'active_auth__mltc')

    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = 'attachment; filename="member_data.csv"'
    response.write('\ufeff')

    writer = csv.writer(response)
    writer.writerow([
        'sadc_member_id', 'first_name', 'last_name', 'alt_name',
        'birth_date', 'gender', 'address', 'phone', 'email',
        'medicaid', 'ssn', 'language', 'enrollment_date', 'note', 
        'mltc', 'mltc_member_id', 'start_date', 'end_date', 'schedule', 'dx_code'
    ])

    for member in members:
        auth = member.active_auth
        writer.writerow([
            member.sadc_member_id,
            member.first_name,
            member.last_name,
            member.alt_name or '',
            member.birth_date.isoformat(),
            member.gender,
            member.address or '',
            member.phone or '',
            member.email or '',
            member.medicaid or '',
            member.ssn or '',
            member.language or '',
            member.enrollment_date.isoformat() if member.enrollment_date else '',
            member.note or '',
            auth.mltc.name if auth and auth.mltc else '',
            auth.mltc_member_id if auth else '',
            auth.start_date.isoformat() if auth and auth.start_date else '',
            auth.end_date.isoformat() if auth and auth.end_date else '',
            ', '.join(day for day in auth.schedule) if auth and auth.schedule else '',
            auth.dx_code if auth else '',
        ])

    return response

def importMembersCsv(request):
    file = request.FILES.get('file')
    if not file or not file.name.endswith('.csv'):
        return Response({'error': 'CSV file required.'}, status=status.HTTP_400_BAD_REQUEST)

    decoded_file = file.read().decode('utf-8-sig').splitlines()
    reader = csv.DictReader(decoded_file)

    sadc = request.user.sadc
    valid_members = []
    member_skipped = 0

    required_fields = ['sadc_member_id', 'first_name', 'last_name', 'birth_date', 'gender']
    for row in reader:
        if not all(row.get(field) for field in required_fields):
            member_skipped += 1
            continue

        row_data = {
            **row,
            'sadc': sadc.id,
        }

        serializer = MemberSerializer(data=row_data, context={'sadc': sadc})
        if serializer.is_valid():
            member_instance = Member(**serializer.validated_data)
            valid_members.append((member_instance, row))
        else:
            member_skipped += 1
            print({serializer.errors})

    created_members = Member.objects.bulk_create([m for m, _ in valid_members])

    # Handle authorizations if applicable
    auth_created = 0
    auth_skipped = 0
    for member, row in zip(created_members, [r for _, r in valid_members]):
        if all(row.get(field) for field in ['mltc', 'mltc_member_id', 'start_date', 'end_date']):
            auth_row = {
                'member': member.id,
                'mltc': row.get('mltc'),
                'mltc_member_id': row.get('mltc_member_id'),
                'start_date': row.get('start_date'),
                'end_date': row.get('end_date'),
                'dx_code': row.get('dx_code'),
                'schedule': [d.strip() for d in row.get('schedule', '').split(',') if d.strip()],
                'active': True
            }

            auth_serializer = AuthorizationSerializer(data=auth_row)
            if auth_serializer.is_valid():
                authorization = auth_serializer.save()
                member.active_auth = authorization
                member.save(update_fields=['active_auth'])
                auth_created += 1
            else:
                auth_skipped += 1
                print(f"Authorization error (member {member.sadc_member_id}): {auth_serializer.errors}")
        else:
            auth_skipped += 1

    return Response({
        'members_created': len(created_members),
        'members_skipped': member_skipped,
        'auth_created': auth_created,
        'auth_skipped': auth_skipped,
    }, status=status.HTTP_200_OK)