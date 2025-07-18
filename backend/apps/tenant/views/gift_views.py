from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from backend.apps.user.permissions import IsAdminUser
from ..utils.gift_utils import (
    updateGift,
    getGiftDetail,
    deleteGift,
    getGiftList,
    createGift,
    getActiveGiftListByMember,
)

@api_view(['GET', 'POST'])
def getGifts(request):
    if request.method == 'POST' and not IsAdminUser().has_permission(request, None):
        return Response({'detail': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        return getGiftList(request)

    if request.method == 'POST':        
        return createGift(request)

@api_view(['GET', 'PUT', 'DELETE'])
def getGift(request, pk):
    if request.method in ['PUT', 'DELETE'] and not IsAdminUser().has_permission(request, None):
        return Response({'detail': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        return getGiftDetail(request, pk=pk)

    if request.method == 'PUT':
        return updateGift(request, pk=pk)

    if request.method == 'DELETE':
        return deleteGift(request, pk=pk)

@api_view(['GET'])
def getActiveGifts(request, pk):
    if request.method == 'GET':
        return getActiveGiftListByMember(request, member_pk=pk)