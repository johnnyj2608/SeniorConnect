from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import get_object_or_404
from ..models.authorization_model import Authorization, AuthorizationService
from ..models.member_model import Member
from ..serializers.authorization_serializers import (
    AuthorizationSerializer, 
    AuthorizationWithServiceSerializer,
    AuthorizationServiceSerializer,
)
from backend.apps.tenant.models.mltc_model import Mltc
from django.db import transaction
import json
from backend.apps.common.utils.supabase import (
    upload_file_to_supabase,
    delete_file_from_supabase,
)
from backend.access.member_access import (
    check_member_access, 
    member_access_filter, 
    member_access_fk
)
from backend.access.ownership_access import require_valid_mltc

@member_access_filter()
def getAuthorizationList(request):
    authorizations = (
        Authorization.objects
        .select_related('mltc')
        .filter(member__in=request.accessible_members_qs)
    )
    serializer = AuthorizationSerializer(authorizations, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

def getAuthorizationDetail(request, pk):
    authorization = get_object_or_404(Authorization.objects.select_related('mltc'), id=pk)
    
    unauthorized = check_member_access(request.user, authorization.member_id)
    if unauthorized: return unauthorized
    
    serializer = AuthorizationSerializer(authorization)
    return Response(serializer.data, status=status.HTTP_200_OK)

@member_access_fk
@transaction.atomic
def createAuthorization(request):
    data = request.data.copy()
    file_path = None

    mltc = Mltc.objects.get(name=data.get("mltc"))
    unauthorized = require_valid_mltc(mltc, request.user)
    if unauthorized: return unauthorized

    file = request.FILES.get('file')
    data.pop('file', None)

    data['schedule'] = data.getlist('schedule', '')[0]
    services = json.loads(data.pop('services', [])[0])

    member_id = data.get('member')
    member = Member.objects.get(id=member_id)
    if not member.active:
            data['active'] = False

    try:
        serializer = AuthorizationSerializer(data=data)

        if serializer.is_valid():
            authorization = serializer.save()

            if file:
                member_sadc = request.user.sadc.id
                new_path = f"{member_sadc}/members/{member_id}/auths/{authorization.id}"

                file_path, error = upload_file_to_supabase(
                    file, 
                    new_path,
                    authorization.file,
                )
            
                if error:
                    raise Exception(f"File upload failed: {error}")
            authorization.file = file_path
            authorization.save()

            for service_data in services:
                auth_id = service_data.get('auth_id')
                service_code = service_data.get('service_code')
                service_units = service_data.get('service_units')

                if not auth_id and not service_code and not service_units:
                    continue

                AuthorizationService.objects.create(authorization=authorization, **service_data)

            response_serializer = AuthorizationWithServiceSerializer(authorization)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        else:
            print(serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(e)
        if file_path:
            delete_file_from_supabase(file_path)
        return Response({"detail": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@member_access_fk
@transaction.atomic
def updateAuthorization(request, pk):
    data = request.data.copy()
    file_path = None

    mltc = Mltc.objects.get(name=data.get("mltc"))
    unauthorized = require_valid_mltc(mltc, request.user)
    if unauthorized: return unauthorized

    services = json.loads(data.pop('services', [])[0])

    member_id = data.get('member')
    member = Member.objects.get(id=member_id)
    if not member.active:
            data['active'] = False

    authorization = get_object_or_404(Authorization.objects.select_related('mltc'), id=pk)
    
    try:
        if 'file' in request.FILES:
            file = request.FILES['file']
            member_sadc = request.user.sadc.id
            new_path = f"{member_sadc}/members/{member_id}/auths/{authorization.id}"

            file_path, error = upload_file_to_supabase(
                file, 
                new_path,
                authorization.file,
            )

            if error:
                raise Exception(f"Photo upload failed: {error}")
            data['file'] = file_path

        elif data.get('file') == '' and authorization.file:
            delete_file_from_supabase(authorization.file)
            data['file'] = None

        serializer = AuthorizationSerializer(instance=authorization, data=data)
        if serializer.is_valid():
            authorization = serializer.save()

            for service_data in services:
                service_id = service_data.get('id')
                auth_id = service_data.get('auth_id')
                service_code = service_data.get('service_code')
                service_units = service_data.get('service_units')

                if not (auth_id or service_code or service_units):
                    if service_id:
                        AuthorizationService.objects.filter(id=service_id, authorization=authorization).delete()
                    continue

                if service_id:
                    service_instance = AuthorizationService.objects.get(id=service_id, authorization=authorization)
                    service_serializer = AuthorizationServiceSerializer(instance=service_instance, data=service_data, partial=True)
                    if service_serializer.is_valid():
                        service_serializer.save()
                    else:
                        return Response(service_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                else:
                    AuthorizationService.objects.create(authorization=authorization, **service_data)

            response_serializer = AuthorizationWithServiceSerializer(authorization)
            return Response(response_serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(e)
        if file_path:
            delete_file_from_supabase(file_path)
        return Response({"detail": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@member_access_fk
def deleteAuthorization(request, pk, member_pk):
    authorization = get_object_or_404(Authorization, id=pk)

    if authorization.file:
        try:
            delete_file_from_supabase(authorization.file)
        except Exception as e:
            print(f"Error deleting file from Supabase: {e}")

    authorization.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

@member_access_fk
def getAuthorizationListByMember(request, member_pk):
    authorizations = (
        Authorization.objects
        .select_related('mltc')
        .prefetch_related('services')
        .filter(member=member_pk)
        .order_by('-active', '-start_date')
    )
    serializer = AuthorizationWithServiceSerializer(authorizations, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)