from rest_framework.response import Response
from rest_framework.decorators import api_view
from ..utils.member_utils import (
    updateMember,
    getMemberDetail,
    deleteMember,
    getMemberList,
    createMember
)

@api_view(['GET', 'POST'])
def getMembers(request):

    if request.method == 'GET':
        return getMemberList(request)

    if request.method == 'POST':
        return createMember(request)


@api_view(['GET', 'PUT', 'DELETE'])
def getMember(request, pk):

    if request.method == 'GET':
        return getMemberDetail(request, pk)

    if request.method == 'PUT':
        return updateMember(request, pk)

    if request.method == 'DELETE':
        return deleteMember(request, pk)