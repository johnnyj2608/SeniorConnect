from django.db import transaction
from rest_framework.response import Response
from ..models.authorization_model import Authorization, MLTC
from ..models.member_model import Member
from ..serializers.authorization_serializer import AuthorizationSerializer
import json

def getAuthorizationList(request):
    authorizations = Authorization.objects.all()
    serializer = AuthorizationSerializer(authorizations, many=True)
    return Response(serializer.data)

def getAuthorizationDetail(request, pk):
    authorization = Authorization.objects.get(id=pk)
    serializer = AuthorizationSerializer(authorization)
    return Response(serializer.data)

def createAuthorization(request):
    data = request.data.copy()
    
    schedule = data.get('schedule', '').split(',')
    data['schedule'] = json.dumps(schedule)
  
    serializer = AuthorizationSerializer(data=data)

    if serializer.is_valid():
        serializer.save()

        if data.get('active', '').lower() == 'true':
            member = Member.objects.get(id=data['member'])
            mltc = MLTC.objects.get(name=data['mltc'])
            member.mltc_id = mltc
            member.save()
    else:
        print(serializer.errors)
    return Response(serializer.data)

def updateAuthorization(request, pk):
    data = request.data
    authorization = Authorization.objects.get(id=pk)
    serializer = AuthorizationSerializer(instance=authorization, data=data)
    if serializer.is_valid():
        if data['active'].lower() == 'true':
            member = Member.objects.get(id=data['member'])
            mltc = MLTC.objects.get(name=data['mltc'])
            member.mltc_id = mltc
            member.save()

        serializer.save()
    else:
        print(serializer.errors)
    return Response(serializer.data)

def deleteAuthorization(request, pk):
    authorization = Authorization.objects.get(id=pk)
    authorization.delete()
    return Response('Authorization was deleted')

def getAuthorizationListByMember(request, member_pk):
    authorizations = Authorization.objects.filter(member=member_pk)
    serializer = AuthorizationSerializer(authorizations, many=True)
    return Response(serializer.data)

def getActiveAuthorizationByMember(request, member_pk):
    authorization = Authorization.objects.filter(member=member_pk, active=True).first()
    serializer = AuthorizationSerializer(authorization)
    return Response(serializer.data)