from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import get_object_or_404
from ..models.authorization_model import Authorization, AuthorizationService
from ..models.member_model import Member
from ..serializers.authorization_serializers import AuthorizationSerializer, AuthorizationWithServiceSerializer
from django.db import transaction
import json

def getAuthorizationList(request):
    authorizations = Authorization.objects.select_related('mltc', 'member').all()
    serializer = AuthorizationSerializer(authorizations, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

def getAuthorizationDetail(request, pk):
    authorization = get_object_or_404(Authorization.objects.select_related('mltc', 'member'), id=pk)
    serializer = AuthorizationSerializer(authorization)
    return Response(serializer.data, status=status.HTTP_200_OK)

def createAuthorization(request):
    data = request.data.copy()
    
    data['schedule'] = data.getlist('schedule', [])[0]
    services = json.loads(data.pop('services', [])[0])

    member_id = data.get('member')
    member = Member.objects.get(id=member_id)
    if not member.active:
            data['active'] = False

    try:
        with transaction.atomic():
            serializer = AuthorizationSerializer(data=data)

            if serializer.is_valid():
                authorization = serializer.save()

                for service_data in services:
                    auth_id = service_data.get('auth_id')
                    service_code = service_data.get('service_code')
                    service_units = service_data.get('service_units')

                    if not auth_id and not service_code and not service_units:
                        continue

                    AuthorizationService.objects.create(authorization=authorization, **service_data)

                response_serializer = AuthorizationSerializer(authorization)
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            else:
                print(serializer.errors)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(e)
        return Response({"detail": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def updateAuthorization(request, pk):
    data = request.data.copy()

    member_id = data.get('member')
    member = Member.objects.get(id=member_id)
    if not member.active:
            data['active'] = False

    authorization = get_object_or_404(Authorization.objects.select_related('mltc', 'member'), id=pk)
    serializer = AuthorizationSerializer(instance=authorization, data=data)
    
    try:
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(e)
        return Response({"detail": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def deleteAuthorization(request, pk):
    authorization = get_object_or_404(Authorization, id=pk)
    authorization.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

def getAuthorizationListByMember(request, member_pk):
    authorizations = (
        Authorization.objects
        .select_related('mltc', 'member')
        .prefetch_related('services')
        .filter(member=member_pk)
        .order_by('-active', '-start_date')
    )
    serializer = AuthorizationWithServiceSerializer(authorizations, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)