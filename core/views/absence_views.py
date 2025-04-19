from rest_framework.response import Response
from rest_framework.decorators import api_view
from ..utils.absence_utils import (
    updateAbsence,
    getAbsenceDetail,
    deleteAbsence,
    getAbsenceList,
    createAbsence
)

@api_view(['GET', 'POST'])
def getAbsences(request):

    if request.method == 'GET':
        return getAbsenceList(request)

    if request.method == 'POST':
        return createAbsence(request)


@api_view(['GET', 'PUT', 'DELETE'])
def getAbsence(request, pk):

    if request.method == 'GET':
        return getAbsenceDetail(request, pk)

    if request.method == 'PUT':
        return updateAbsence(request, pk)

    if request.method == 'DELETE':
        return deleteAbsence(request, pk)