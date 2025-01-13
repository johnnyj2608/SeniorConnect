from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Member
from .serializers import MemberSerializer

# Create your views here.

@api_view(['GET'])
def getRoutes(request):

    routes = [
        {
            'Endpoint': '/members/',
            'method': 'GET',
            'body': None,
            'description': 'Returns an array of members'
        },
        {
            'Endpoint': '/members/id',
            'method': 'GET',
            'body': None,
            'description': 'Returns a single member object'
        },
        {
            'Endpoint': '/members/create/',
            'method': 'POST',
            'body': {'body': ""},
            'description': 'Creates new member with data sent in post request'
        },
        {
            'Endpoint': '/members/id/update/',
            'method': 'PUT',
            'body': {'body': ""},
            'description': 'Creates an existing member with data sent in post request'
        },
        {
            'Endpoint': '/members/id/delete/',
            'method': 'DELETE',
            'body': None,
            'description': 'Deletes and exiting member'
        },
    ]

    return Response(routes)

@api_view(['GET'])
def getMembers(request):
    members = Member.objects.all()
    serializer = MemberSerializer(members, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def getMember(request, pk):
    member = Member.objects.get(id=pk)
    serializer = MemberSerializer(member, many=False)
    return Response(serializer.data)