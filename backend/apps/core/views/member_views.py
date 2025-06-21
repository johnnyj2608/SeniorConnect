from rest_framework.response import Response
from rest_framework.decorators import api_view
from ..utils.member_utils import (
    updateMember,
    getMemberDetail,
    deleteMember,
    getMemberList,
    createMember,
    getActiveAuth,
    getActiveMemberStats,
    getUpcomingBirthdays,
    toggleMemberStatus,
    getMemberProfile,
    restoreMember,
    getDeletedMembers,
    exportMembersCsv,
    importMembersCsv,
)

@api_view(['GET', 'POST'])
def getMembers(request):

    if request.method == 'GET':
        return getMemberList(request)

    if request.method == 'POST':
        return createMember(request)


@api_view(['GET', 'PUT', 'DELETE', 'PATCH'])
def getMember(request, pk):

    if request.method == 'GET':
        return getMemberDetail(request, pk=pk)

    if request.method == 'PUT':
        return updateMember(request, pk=pk)

    if request.method == 'DELETE':
        return deleteMember(request, pk=pk)
    
    if request.method == 'PATCH':
        return restoreMember(request, pk=pk)
    
@api_view(['PATCH'])
def toggleStatus(request, pk):
    if request.method == 'PATCH':
        return toggleMemberStatus(request, pk=pk)
    
@api_view(['GET'])
def getMemberAuth(request, pk):
    if request.method == 'GET':
        return getActiveAuth(request, pk=pk)
    
@api_view(['GET'])
def getMembersStats(request):
    if request.method == 'GET':
        return getActiveMemberStats(request)
    
@api_view(['GET'])
def getMembersBirthdays(request):
    if request.method == 'GET':
        return getUpcomingBirthdays(request)
    
@api_view(['GET'])
def getMemberFull(request, pk):
    if request.method == 'GET':
        return getMemberProfile(request, pk=pk)
    
@api_view(['GET'])
def getMembersDeleted(request):
    if request.method == 'GET':
        return getDeletedMembers(request)
    
@api_view(['GET', 'POST'])
def getMembersCsv(request):
    if request.method == 'GET':
        return exportMembersCsv(request)
    
    if request.method == 'POST':
        return importMembersCsv(request)