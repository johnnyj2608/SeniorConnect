from rest_framework.response import Response
from ..models.authorization_model import Authorization, Diagnosis, MLTC
from ..models.member_model import Member
from ..serializers.authorization_serializer import AuthorizationSerializer

def getAuthorizationList(request):
    authorizations = Authorization.objects.all().order_by('mltc', 'sadc_member_id')
    serializer = AuthorizationSerializer(authorizations, many=True)
    return Response(serializer.data)

def getAuthorizationDetail(request, pk):
    authorization = Authorization.objects.get(id=pk)
    serializer = AuthorizationSerializer(authorization)
    return Response(serializer.data)

def createAuthorization(request):
    data = request.data

    member = Member.objects.get(id=data['member_id'])
    mltc = MLTC.objects.get(name=data['mltc'])
    diagnosis = MLTC.objects.get(name=data['diagnosis'])

    authorization = Authorization.objects.create(
        mltc_member_id=data['mltc_member_id'],
        mltc_id=mltc.id,
        mltc_auth_id=data['mltc_auth_id'],
        member_id=member,
        schedule=data.get('schedule', []),
        start_date=data['start_date'],
        end_date=data['end_date'],
        diagnosis=diagnosis.id,
        sdc_code=data.get('sdc_code', None),
        trans_code=data.get('trans_code', None),
    )
    serializer = AuthorizationSerializer(authorization)
    return Response(serializer.data)

def updateAuthorization(request, pk):
    data = request.data
    authorization = Authorization.objects.get(id=pk)
    serializer = AuthorizationSerializer(instance=authorization, data=data)

    if serializer.is_valid():
        serializer.save()
    else:
        print(serializer.errors)
    return Response(serializer.data)

def deleteAuthorization(request, pk):
    authorization = Authorization.objects.get(id=pk)
    authorization.delete()
    return Response('Authorization was deleted')

def getAuthorizationListByMember(request, member_pk):
    authorizations = Authorization.objects.filter(member_id=member_pk).order_by('-start_date')
    serializer = AuthorizationSerializer(authorizations, many=True)
    return Response(serializer.data)