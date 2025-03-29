from rest_framework.response import Response
from rest_framework.decorators import api_view
from ..utils.authorization_utils import (
    updateAuthorization,
    getAuthorizationDetail,
    deleteAuthorization,
    getAuthorizationList,
    createAuthorization
)

@api_view(['GET', 'POST'])
def getAuthorizations(request):

    if request.method == 'GET':
        return getAuthorizationList(request)

    if request.method == 'POST':
        return createAuthorization(request)


@api_view(['GET', 'PUT', 'DELETE'])
def getAuthorization(request, pk):

    if request.method == 'GET':
        return getAuthorizationDetail(request, pk)

    if request.method == 'PUT':
        return updateAuthorization(request, pk)

    if request.method == 'DELETE':
        return deleteAuthorization(request, pk)