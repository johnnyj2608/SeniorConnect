from rest_framework.response import Response
from ..models.contact_model import Contact
from ..models.member_model import Member
from ..serializers.contact_serializer import ContactSerializer

def getContactList(request):
    contacts = Contact.objects.all()
    serializer = ContactSerializer(contacts, many=True)
    return Response(serializer.data)

def getContactDetail(request, pk):
    contact = Contact.objects.get(id=pk)
    serializer = ContactSerializer(contact)
    return Response(serializer.data)

def createContact(request):
    data = request.data

    member = Member.objects.get(id=data['member_id'])

    contact = Contact.objects.create(
        member_id=member,
        contact_type=data['contact_type'],
        name=data['name'],
        phone=data['phone'],
        relationship_type=data.get('relationship_type', None), 
    )
    serializer = ContactSerializer(contact)
    return Response(serializer.data)

def updateContact(request, pk):
    data = request.data
    contact = Contact.objects.get(id=pk)
    serializer = ContactSerializer(instance=contact, data=data)

    if serializer.is_valid():
        serializer.save()
    else:
        print(serializer.errors)
    return Response(serializer.data)

def deleteContact(request, pk):
    contact = Contact.objects.get(id=pk)
    contact.delete()
    return Response('Contact was deleted')

def getContactListByMember(request, member_pk):
    contacts = Contact.objects.filter(member_id=member_pk)
    serializer = ContactSerializer(contacts, many=True)
    return Response(serializer.data)

def searchContactList(request):
    contact_type = request.query_params.get('contact_type', '')
    name_query = request.query_params.get('name', '')
    
    contacts = Contact.objects.all()

    if name_query:
        contacts = contacts.filter(name__icontains=name_query)

    if contact_type:
        contacts = contacts.filter(contact_type=contact_type)

    serializer = ContactSerializer(contacts, many=True)
    return Response(serializer.data)