from rest_framework.response import Response
from rest_framework.decorators import api_view
from user.permissions import IsAdminUser
from ..utils.language_utils import (
    updateLanguage,
    getLanguageDetail,
    deleteLanguage,
    getLanguageList,
    createLanguage
)

@api_view(['GET', 'POST'])
def getLanguages(request):
    if request.method == 'GET':
        return getLanguageList(request)

    if request.method == 'POST':
        permission = IsAdminUser()
        if not permission.has_permission(request, None):
            return Response({'detail': 'Admin access required.'}, status=403)
        return createLanguage(request)

@api_view(['GET', 'PUT', 'DELETE'])
def getLanguage(request, pk):
    if request.method == 'GET':
        return getLanguageDetail(request, pk=pk)

    permission = IsAdminUser()
    if not permission.has_permission(request, None):
        return Response({'detail': 'Admin access required.'}, status=403)

    if request.method == 'PUT':
        return updateLanguage(request, pk=pk)

    if request.method == 'DELETE':
        return deleteLanguage(request, pk=pk)