from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import get_object_or_404
from ..models.contact_model import Contact
from ..models.member_model import Member
from ..serializers.contact_serializers import ContactSerializer
from backend.access.member_access import (
    check_member_access, 
    member_access_filter, 
    member_access_fk
)

@member_access_filter()
def getContactList(request):
    accessible_members = request.accessible_members_qs
    contacts = Contact.objects.filter(members__in=accessible_members).distinct()
    serializer = ContactSerializer(contacts.prefetch_related('members'), many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

def getContactDetail(request, pk):
    contact = get_object_or_404(Contact.objects.prefetch_related('members'), id=pk)
    
    for member in contact.members.all():
        unauthorized = check_member_access(request.user, member.id)
        if unauthorized: return unauthorized
        
    serializer = ContactSerializer(contact)
    return Response(serializer.data, status=status.HTTP_200_OK)

def createContact(request):
    data = request.data
    member_pks = data.getlist('members')
    member = get_object_or_404(Member, id=member_pks[-1])

    unauthorized = check_member_access(request.user, member.id)
    if unauthorized: return unauthorized

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

@member_access_fk
def updateContact(request, pk, member_pk):
    data = request.data
    contact = get_object_or_404(Contact.objects.prefetch_related('members'), id=pk)
    member = get_object_or_404(Member, id=member_pk)
    contact._acting_member = member

    serializer = ContactSerializer(instance=contact, data=data)
    
    try:
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(e)
        return Response({"detail": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@member_access_fk
def deleteContact(request, pk, member_pk):
    contact = get_object_or_404(Contact, id=pk)
    members = contact.members.all()

    deletedMember = members.filter(id=member_pk).first()

    if deletedMember:
        contact.members.remove(deletedMember)

    if len(contact.members.all()) == 0:
        contact.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    return Response({'detail': 'Member association removed'}, status=status.HTTP_200_OK)

def searchContactList(request):
    contact_type = request.query_params.get('contact_type', '')
    name_query = request.query_params.get('name', '')
    member_pk = request.query_params.get('member_pk', None)

    current_user=request.user
    
    contacts = Contact.objects.filter(members__sadc=current_user.sadc).distinct()

    if name_query:
        contacts = contacts.filter(name__icontains=name_query)

    if contact_type:
        contacts = contacts.filter(contact_type=contact_type)

    if member_pk:
        contacts = contacts.exclude(members__id=member_pk)

    contacts = contacts.prefetch_related('members')
    serializer = ContactSerializer(contacts, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)