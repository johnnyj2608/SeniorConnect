from rest_framework.response import Response
from rest_framework.decorators import api_view
from ..utils.member_utils import (
    updateMember,
    getMemberDetail,
    deleteMember,
    getMemberList,
    createMember,
    getActiveMemberStats,
    getUpcomingBirthdays,
    toggleMemberStatus,
    getMemberDetailFull,
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
        return getMemberDetail(request, pk)

    if request.method == 'PUT':
        return updateMember(request, pk)

    if request.method == 'DELETE':
        return deleteMember(request, pk)
    
    if request.method == 'PATCH':
        return toggleMemberStatus(request, pk)
    
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
        return getMemberDetailFull(request, pk)