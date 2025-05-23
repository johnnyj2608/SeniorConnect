from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import get_object_or_404
from ..models.authorization_model import Authorization
from ..models.member_model import Member
from ..serializers.authorization_serializers import AuthorizationSerializer
import json
from .handle_serializer import handle_serializer

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
    
    schedule = data.get('schedule', '').split(',')
    data['schedule'] = json.dumps(schedule)

    member_id = data.get('member')
    member = Member.objects.get(id=member_id)
    if not member.active:
            data['active'] = False
  
    serializer = AuthorizationSerializer(data=data)
    return handle_serializer(serializer, success_status=status.HTTP_201_CREATED)

def updateAuthorization(request, pk):
    data = request.data.copy()

    member_id = data.get('member')
    member = Member.objects.get(id=member_id)
    if not member.active:
            data['active'] = False

    authorization = get_object_or_404(Authorization.objects.select_related('mltc', 'member'), id=pk)
    serializer = AuthorizationSerializer(instance=authorization, data=data)
    return handle_serializer(serializer, success_status=status.HTTP_200_OK)

def deleteAuthorization(request, pk):
    authorization = get_object_or_404(Authorization, id=pk)
    authorization.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

def getAuthorizationListByMember(request, member_pk):
    authorizations = (
        Authorization.objects
        .select_related('mltc', 'member')
        .filter(member=member_pk)
        .order_by('-active', '-start_date')
    )
    serializer = AuthorizationSerializer(authorizations, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)