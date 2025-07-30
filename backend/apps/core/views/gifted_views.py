from rest_framework.response import Response
from rest_framework.decorators import api_view
from ..utils.gifted_utils import (
    updateGifted,
    getGiftedDetail,
    deleteGifted,
    getGiftedList,
    createGifted,
    getGiftedListByMember,
    getReceivedMembersByGift,
)

@api_view(['GET', 'POST'])
def getGifteds(request):

    if request.method == 'GET':
        return getGiftedList(request)

    if request.method == 'POST':
        return createGifted(request)


@api_view(['GET', 'PUT'])
def getGifted(request, pk):

    if request.method == 'GET':
        return getGiftedDetail(request, pk=pk)

    if request.method == 'PUT':
        return updateGifted(request, pk=pk)

@api_view(['DELETE'])
def giftedDelete(request, pk, member_pk):
    if request.method == 'DELETE':
        return deleteGifted(request, pk=pk, member_pk=member_pk)
    
@api_view(['GET'])
def getGiftedsByMember(request, pk):
    if request.method == 'GET':
        return getGiftedListByMember(request, member_pk=pk)

@api_view(['GET'])
def getReceivedGifts(request, pk):
    if request.method == 'GET':
        return getReceivedMembersByGift(request, pk=pk)