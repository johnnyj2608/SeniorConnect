from rest_framework.response import Response
from rest_framework.decorators import api_view
from ..utils.contact_utils import (
    updateContact,
    getContactDetail,
    deleteContact,
    getContactList,
    createContact,
    getContactListByMember,
    searchContactList,
)

@api_view(['GET', 'POST'])
def getContacts(request):
    if request.method == 'GET':
        return getContactList(request)

    if request.method == 'POST':
        return createContact(request)

@api_view(['GET'])
def getContact(request, pk):
    if request.method == 'GET':
        return getContactDetail(request, pk)

@api_view(['GET'])
def getContactsByMember(request, pk):
    if request.method == 'GET':
        return getContactListByMember(request, pk)
    

@api_view(['PUT', 'DELETE'])
def getContactWithMember(request, pk, member_id):
    if request.method == 'PUT':
        return updateContact(request, pk, member_id)
    
    if request.method == 'DELETE':
        return deleteContact(request, pk, member_id)
    
@api_view(['GET'])
def searchContacts(request):
    if request.method == 'GET':
        return searchContactList(request)