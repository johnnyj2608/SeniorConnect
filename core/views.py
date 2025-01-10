from django.shortcuts import render
from django.http import JsonResponse

# Create your views here.

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

    return JsonResponse(routes, safe=False)