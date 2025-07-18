from rest_framework.response import Response
from rest_framework.decorators import api_view
from ..utils.enrollment_utils import (
    updateEnrollment,
    getEnrollmentDetail,
    deleteEnrollment,
    getEnrollmentList,
    createEnrollment,
    getCurrentMonthEnrollmentStats,
    getRecentEnrollments,
)

@api_view(['GET', 'POST'])
def getEnrollments(request):

    if request.method == 'GET':
        return getEnrollmentList(request)

    if request.method == 'POST':
        return createEnrollment(request)


@api_view(['GET', 'PUT', 'DELETE'])
def getEnrollment(request, pk):

    if request.method == 'GET':
        return getEnrollmentDetail(request,  pk=pk)

    if request.method == 'PUT':
        return updateEnrollment(request,  pk=pk)

    if request.method == 'DELETE':
        return deleteEnrollment(request,  pk=pk)


@api_view(['GET'])
def getEnrollmentStats(request):
    if request.method == 'GET':
        return getCurrentMonthEnrollmentStats(request)
    
@api_view(['GET'])
def getEnrollmentRecent(request):
    if request.method == 'GET':
        return getRecentEnrollments(request)