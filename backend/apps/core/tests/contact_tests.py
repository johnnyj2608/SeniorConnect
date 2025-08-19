import pytest
from django.urls import reverse
from django.core.exceptions import ValidationError
from rest_framework import status
from backend.apps.core.models.contact_model import Contact

# ==============================
# Contact Listing Tests
# ==============================

@pytest.mark.django_db
def test_get_contact_list(api_client_regular, members_setup):
    member = members_setup["members"][0]
    Contact.objects.create(
        name="Bob",
        phone="9998887777",
        contact_type=Contact.PHARMACY
    ).members.add(member)

    url = reverse("contacts")
    response = api_client_regular.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert any(c["name"] == "Bob" for c in response.data)

# ==============================
# Contact Detail Tests
# ==============================

@pytest.mark.django_db
def test_get_contact_detail(api_client_regular, members_setup):
    member = members_setup["members"][0]
    contact = Contact.objects.create(
        name="Charlie",
        phone="5554443333",
        contact_type=Contact.HOME_AID
    )
    contact.members.add(member)

    url = reverse("contact", args=[contact.id])
    response = api_client_regular.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data["name"] == "Charlie"

@pytest.mark.django_db
def test_regular_user_cannot_access_other_org_contact(api_client_regular, other_org_setup):
    other_member = other_org_setup["other_member"]
    contact = Contact.objects.create(
        name="Unauthorized Contact",
        phone="4445556666",
        contact_type=Contact.EMERGENCY,
        relationship_type=Contact.FRIEND
    )
    contact.members.add(other_member)

    url = reverse("contact", args=[contact.id])
    response = api_client_regular.get(url)
    assert response.status_code == status.HTTP_403_FORBIDDEN

    url_update = reverse("contact_with_member", args=[contact.id, other_member.id])
    payload = {"members": [other_member.id], "name": "Hacker Update", "phone": "0001112222"}
    response = api_client_regular.put(url_update, data=payload, format="json")
    assert response.status_code == status.HTTP_403_FORBIDDEN

    response = api_client_regular.delete(url_update)
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_admin_cannot_access_other_org_contact(api_client_admin, other_org_setup):
    other_member = other_org_setup["other_member"]
    contact = Contact.objects.create(
        name="Other Org Contact",
        phone="7778889999",
        contact_type=Contact.PHARMACY
    )
    contact.members.add(other_member)

    url = reverse("contact", args=[contact.id])
    response = api_client_admin.get(url)
    assert response.status_code == status.HTTP_403_FORBIDDEN

# ==============================
# Contact Create Tests
# ==============================

@pytest.mark.django_db
def test_create_contact(api_client_regular, members_setup):
    member = members_setup["members"][0]
    url = reverse("contacts")
    payload = {
        "name": "Alice",
        "phone": "1112223333",
        "contact_type": Contact.EMERGENCY,
        "relationship_type": Contact.WIFE,
        "members": [member.id],
    }

    response = api_client_regular.post(url, data=payload)
    assert response.status_code == status.HTTP_201_CREATED
    contact = Contact.objects.get(name="Alice")
    assert contact.members.filter(id=member.id).exists()

# ==============================
# Contact Update Tests
# ==============================

@pytest.mark.django_db
def test_update_contact(api_client_regular, members_setup):
    member = members_setup["members"][0]
    contact = Contact.objects.create(
        name="David",
        phone="2223334444",
        contact_type=Contact.HOME_CARE
    )
    contact.members.add(member)

    url = reverse("contact_with_member", args=[contact.id, member.id])
    payload = {
        "members": [member.id],
        "name": "David Updated",
        "phone": "2223334444",
        "contact_type": Contact.HOME_CARE,
    }

    response = api_client_regular.put(url, data=payload, format="json")
    assert response.status_code == status.HTTP_200_OK
    contact.refresh_from_db()
    assert contact.name == "David Updated"

# ==============================
# Contact Delete Tests
# ==============================

@pytest.mark.django_db
def test_delete_contact_last_member_deletes_contact(api_client_regular, members_setup):
    member = members_setup["members"][0]
    contact = Contact.objects.create(
        name="Eve",
        phone="1110002222",
        contact_type=Contact.OTHER
    )
    contact.members.add(member)

    url = reverse("contact_with_member", args=[contact.id, member.id])
    response = api_client_regular.delete(url)

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not Contact.objects.filter(id=contact.id).exists()


@pytest.mark.django_db
def test_delete_contact_with_multiple_members_removes_association_only(api_client_regular, members_setup):
    member1 = members_setup["members"][0]
    member2 = members_setup["members"][1]

    contact = Contact.objects.create(
        name="Alice",
        phone="9998887777",
        contact_type=Contact.EMERGENCY,
        relationship_type=Contact.SON
    )
    contact.members.add(member1, member2)

    url = reverse("contact_with_member", args=[contact.id, member1.id])
    response = api_client_regular.delete(url)

    assert response.status_code == status.HTTP_200_OK
    contact.refresh_from_db()
    assert member1 not in contact.members.all()
    assert member2 in contact.members.all()
    assert Contact.objects.filter(id=contact.id).exists()

# ==============================
# Contact Search Tests
# ==============================

@pytest.mark.django_db
def test_search_contacts_by_name_and_type(api_client_regular, members_setup):
    member = members_setup["members"][0]
    c1 = Contact.objects.create(name="Alice Smith", phone="1231231234", contact_type=Contact.EMERGENCY)
    c1.members.add(member)
    c2 = Contact.objects.create(name="Bob Jones", phone="5555555555", contact_type=Contact.PHARMACY)
    c2.members.add(member)

    url = reverse("contact_search") + f"?name=Alice&contact_type={Contact.EMERGENCY}"
    response = api_client_regular.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]["name"] == "Alice Smith"


# ==============================
# Contact Validation Tests
# ==============================

@pytest.mark.django_db
def test_contact_relationship_validation():
    contact = Contact(
        contact_type=Contact.EMERGENCY,
        name="John Doe",
        phone="1234567890"
    )
    with pytest.raises(ValidationError):
        contact.clean()

    contact = Contact(
        contact_type=Contact.PHARMACY,
        name="Pharma",
        phone="1234567890",
        relationship_type=Contact.FRIEND
    )
    with pytest.raises(ValidationError):
        contact.clean()

    contact = Contact(
        contact_type=Contact.EMERGENCY,
        name="Jane Doe",
        phone="1234567890",
        relationship_type=Contact.SON
    )
    contact.clean()  # Should not raise