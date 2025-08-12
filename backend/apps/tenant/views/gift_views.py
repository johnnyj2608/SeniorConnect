from rest_framework.response import Response
from rest_framework.decorators import api_view
from ..utils.gift_utils import (
    updateGift,
    getGiftDetail,
    deleteGift,
    getGiftList,
    createGift,
    getReceivedMembersByGift,
    getUnreceivedMembersByGift,
)

@api_view(['GET', 'POST'])
def getGifts(request):
    if request.method == 'GET':
        return getGiftList(request)

    if request.method == 'POST':        
        return createGift(request)

@api_view(['GET', 'PUT', 'DELETE'])
def getGift(request, pk):
    if request.method == 'GET':
        return getGiftDetail(request, pk=pk)

    if request.method == 'PUT':
        return updateGift(request, pk=pk)

    if request.method == 'DELETE':
        return deleteGift(request, pk=pk)
    

@api_view(['GET'])
def getReceivedGifts(request, pk):
    if request.method == 'GET':
        return getReceivedMembersByGift(request, pk=pk)
    
@api_view(['GET'])
def getUnreceivedGifts(request, pk):
    if request.method == 'GET':
        return getUnreceivedMembersByGift(request, pk=pk)