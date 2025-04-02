from rest_framework.response import Response
from rest_framework.decorators import api_view
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
        return createLanguage(request)


@api_view(['GET', 'PUT', 'DELETE'])
def getLanguage(request, pk):

    if request.method == 'GET':
        return getLanguageDetail(request, pk)

    if request.method == 'PUT':
        return updateLanguage(request, pk)

    if request.method == 'DELETE':
        return deleteLanguage(request, pk)