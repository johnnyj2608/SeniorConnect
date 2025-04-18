from datetime import datetime
from django.db import transaction
from rest_framework.response import Response
from ..models.authorization_model import Authorization, MLTC
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
    try:
        member = Member.objects.get(id=data['member'])
        mltc = MLTC.objects.get(name=data['mltc'])
        
        schedule = data.get('schedule', '').split(',')
        active = data.get('active', '').lower() == 'true'

        with transaction.atomic():
            authorization = Authorization.objects.create(
                mltc_member_id=data['mltc_member_id'],
                mltc_id=mltc.id,
                mltc_auth_id=data['mltc_auth_id'],
                member=member,
                schedule=schedule,
                start_date=data['start_date'],
                end_date=data['end_date'],
                dx_code=data.get('dx_code', ''),
                sdc_code=data.get('sdc_code', ''),
                trans_code=data.get('trans_code', ''),
                active=active,
            )

            if active == True:
                member.mltc_id = mltc

            member.save()
        serializer = AuthorizationSerializer(authorization)
        return Response(serializer.data)
    except Member.DoesNotExist:
        return Response({'error': 'Member not found'}, status=404)
    except MLTC.DoesNotExist:
        return Response({'error': 'MLTC not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=400)

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
    authorizations = Authorization.objects.filter(member=member_pk).order_by('-start_date', '-id')
    serializer = AuthorizationSerializer(authorizations, many=True)
    return Response(serializer.data)