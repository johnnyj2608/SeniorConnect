from rest_framework.response import Response
from rest_framework.decorators import api_view
from ..utils.mltc_utils import (
    updateMLTC,
    getMLTCDetail,
    deleteMLTC,
    getMLTCList,
    createMLTC
)

@api_view(['GET', 'POST'])
def getMLTCs(request):

    if request.method == 'GET':
        return getMLTCList(request)

    if request.method == 'POST':
        return createMLTC(request)


@api_view(['GET', 'PUT', 'DELETE'])
def getMLTC(request, pk):

    if request.method == 'GET':
        return getMLTCDetail(request, pk)

    if request.method == 'PUT':
        return updateMLTC(request, pk)

    if request.method == 'DELETE':
        return deleteMLTC(request, pk)