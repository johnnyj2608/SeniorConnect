from rest_framework.response import Response
from rest_framework.generics import get_object_or_404
from ..models.authorization_model import Authorization
from ..models.member_model import Member
from ..serializers.authorization_serializer import AuthorizationSerializer
import json

def getAuthorizationList(request):
    authorizations = Authorization.objects.select_related('mltc', 'member').all()
    serializer = AuthorizationSerializer(authorizations, many=True)
    return Response(serializer.data)

def getAuthorizationDetail(request, pk):
    authorization = get_object_or_404(Authorization.objects.select_related('mltc', 'member'), id=pk)
    serializer = AuthorizationSerializer(authorization)
    return Response(serializer.data)

def createAuthorization(request):
    data = request.data.copy()
    
    schedule = data.get('schedule', '').split(',')
    data['schedule'] = json.dumps(schedule)

    member_id = data.get('member')
    member = Member.objects.get(id=member_id)
    if not member.active:
            data['active'] = False
  
    serializer = AuthorizationSerializer(data=data)
    if serializer.is_valid():
        try:
            serializer.save()
        except Exception as e:
            print(e)
    else:
        print("Serializer error:", serializer.errors)
        return Response(serializer.errors, status=400)
    return Response(serializer.data)

def updateAuthorization(request, pk):
    data = request.data.copy()

    member_id = data.get('member')
    member = Member.objects.get(id=member_id)
    if not member.active:
            data['active'] = False

    authorization = get_object_or_404(Authorization.objects.select_related('mltc', 'member'), id=pk)
    serializer = AuthorizationSerializer(instance=authorization, data=data)
    if serializer.is_valid():
        try:
            serializer.save()
        except Exception as e:
            print(e)
    else:
        print("Serializer error:", serializer.errors)
        return Response(serializer.errors, status=400)
    return Response(serializer.data)

def deleteAuthorization(request, pk):
    authorization = get_object_or_404(Authorization, id=pk)
    authorization.delete()
    return Response('Authorization was deleted')

def getAuthorizationListByMember(request, member_pk):
    authorizations = Authorization.objects.select_related('mltc', 'member').filter(member=member_pk)
    serializer = AuthorizationSerializer(authorizations, many=True)
    return Response(serializer.data)