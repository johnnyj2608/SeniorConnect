from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .utils import (
    updateMember,
    getMemberDetail,
    deleteMember,
    getMemberList,
    createMember
)

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

@api_view(['GET', 'POST'])
def getMembers(request):

    if request.method == 'GET':
        return getMemberList(request)

    if request.method == 'POST':
        return createMember(request)


@api_view(['GET', 'PUT', 'DELETE'])
def getMember(request, pk):

    if request.method == 'GET':
        return getMemberDetail(request, pk)

    if request.method == 'PUT':
        return updateMember(request, pk)

    if request.method == 'DELETE':
        return deleteMember(request, pk)