from rest_framework.response import Response
from ..models.authorization_model import Authorization, Diagnosis
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

    authorization = Authorization.objects.create(
        mltc_member_id=data['mltc_member_id'],
        mltc_id=data['mltc'],
        mltc_auth_id=data['mltc_auth_id'],
        member_id=data['member_id'],
        schedule=data.get('schedule', []),
        start_date=data['start_date'],
        end_date=data['end_date'],
        # diagnosis=data['diagnosis'],
        social_day_care_code=data.get('social_day_care_code', None),
        transportation_code=data.get('transportation_code', None),
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