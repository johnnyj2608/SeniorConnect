from rest_framework.response import Response
from rest_framework.decorators import api_view
from ..utils.authorization_utils import (
    updateAuthorization,
    getAuthorizationDetail,
    deleteAuthorization,
    getAuthorizationList,
    createAuthorization,
    getAuthorizationListByMember,
)

@api_view(['GET', 'POST'])
def getAuthorizations(request):

    if request.method == 'GET':
        return getAuthorizationList(request)

    if request.method == 'POST':
        return createAuthorization(request)


@api_view(['GET', 'PUT'])
def getAuthorization(request, pk):

    if request.method == 'GET':
        return getAuthorizationDetail(request, pk=pk)

    if request.method == 'PUT':
        return updateAuthorization(request, pk=pk)
    
@api_view(['DELETE'])
def authorizationDelete(request, pk, member_pk):
    if request.method == 'DELETE':
        return deleteAuthorization(request, pk=pk, member_pk=member_pk)

@api_view(['GET'])
def getAuthorizationsByMember(request, pk):
    if request.method == 'GET':
        return getAuthorizationListByMember(request, member_pk=pk)