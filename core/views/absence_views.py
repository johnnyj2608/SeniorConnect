from rest_framework.response import Response
from rest_framework.decorators import api_view
from ..utils.absence_utils import (
    updateAbsence,
    getAbsenceDetail,
    deleteAbsence,
    getAbsenceList,
    createAbsence,
    getAbsenceListByMember,
    getUpcomingAbsences,
    getAssessmentList,
    getUpcomingAssessments,
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
        return getAbsenceDetail(request, pk=pk)

    if request.method == 'PUT':
        return updateAbsence(request, pk=pk)

    if request.method == 'DELETE':
        return deleteAbsence(request, pk=pk)
    
@api_view(['GET'])
def getAbsencesByMember(request, pk):
    if request.method == 'GET':
        return getAbsenceListByMember(request, member_pk=pk)
    
@api_view(['GET'])
def getAbsencesUpcoming(request):
    if request.method == 'GET':
        return getUpcomingAbsences(request)
    
@api_view(['GET'])
def getAssessments(request):
    if request.method == 'GET':
        return getAssessmentList(request)
    
@api_view(['GET'])
def getAssessmentUpcoming(request):
    if request.method == 'GET':
        return getUpcomingAssessments(request)