from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import get_object_or_404
from ..models.contact_model import Contact
from ..models.member_model import Member
from ..serializers.contact_serializer import ContactSerializer
from .handle_serializer import handle_serializer

def getContactList(request):
    contacts = Contact.objects.prefetch_related('members').all()
    serializer = ContactSerializer(contacts, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

def getContactDetail(request, pk):
    contact = get_object_or_404(Contact.objects.prefetch_related('members'), id=pk)
    serializer = ContactSerializer(contact)
    return Response(serializer.data, status=status.HTTP_200_OK)

def createContact(request):
    data = request.data
    member_ids = data.getlist('members')
    member = get_object_or_404(Member, id=member_ids[-1])

    contact, created = Contact.objects.get_or_create(
        name=data['name'],
        phone=data['phone'],
        contact_type=data['contact_type'],
        defaults={
            'relationship_type': data.get('relationship_type', None),
        }
    )

    contact.members.add(member)
    serializer = ContactSerializer(contact)
    return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

def updateContact(request, pk):
    data = request.data
    contact = get_object_or_404(Contact.objects.prefetch_related('members'), id=pk)
    serializer = ContactSerializer(instance=contact, data=data)
    return handle_serializer(serializer, success_status=status.HTTP_200_OK)

def deleteContact(request, pk, member_id):
    contact = get_object_or_404(Contact, id=pk)
    members = contact.members.all()

    deletedMember = members.filter(id=member_id).first()

    if deletedMember:
        contact.members.remove(deletedMember)

    if len(contact.members.all()) == 0:
        contact.delete()
        return Response({'detail': 'Contact and association deleted'}, status=status.HTTP_204_NO_CONTENT)
    
    return Response({'detail': 'Member association removed'}, status=status.HTTP_200_OK)

def getContactListByMember(request, member_pk):
    contacts = Contact.objects.prefetch_related('members').filter(members__id=member_pk)
    serializer = ContactSerializer(contacts, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

def searchContactList(request):
    contact_type = request.query_params.get('contact_type', '')
    name_query = request.query_params.get('name', '')
    member_id = request.query_params.get('member_id', None)
    
    contacts = Contact.objects.all()

    if name_query:
        contacts = contacts.filter(name__icontains=name_query)

    if contact_type:
        contacts = contacts.filter(contact_type=contact_type)

    if member_id:
        contacts = contacts.exclude(members__id=member_id)

    contacts = contacts.prefetch_related('members')
    serializer = ContactSerializer(contacts, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)