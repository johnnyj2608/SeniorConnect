import pytest
from django.urls import reverse
from django.core.exceptions import ValidationError
from rest_framework import status
from backend.apps.core.models.contact_model import Contact
from backend.apps.core.models.member_model import Member

# ==============================
# Contact List Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,other_sadc_flag,should_see,member_index",
    [
        # 1. Admin can see contact for own SADC member
        ("api_client_admin", False, True, 0),

        # 2. Admin cannot see contact for other SADC member
        ("api_client_admin", True, False, 0),

        # 3. Regular user can see contact for accessible member
        ("api_client_regular", False, True, 0),

        # 4. Regular user cannot see contact for member in other SADC
        ("api_client_regular", True, False, 0),
    ]
)
def test_contact_list(
    request,
    user_fixture,
    other_sadc_flag,
    should_see,
    member_index,
    members_setup,
    other_org_setup,
):
    client = request.getfixturevalue(user_fixture)

    # Pick member based on flag
    if other_sadc_flag:
        member = other_org_setup["other_member"]
    else:
        member = members_setup["members"][member_index]

    # Create contact linked to that member
    contact = Contact.objects.create(
        name="Test Contact",
        phone="1234567890",
        contact_type=Contact.PHARMACY
    )
    contact.members.add(member)

    url = reverse("contacts")
    response = client.get(url)
    assert response.status_code == status.HTTP_200_OK

    results = response.data
    if should_see:
        assert any(c["id"] == contact.id for c in results)
    else:
        assert all(c["id"] != contact.id for c in results)

# ==============================
# Contact Detail Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,other_sadc_flag,should_see,not_found,member_index",
    [
        # 1. Admin can get contact for own SADC member
        ("api_client_admin", False, True, False, 0),

        # 2. Admin cannot get contact for other SADC member
        ("api_client_admin", True, False, False, 0),

        # 3. Regular can get contact for accessible member
        ("api_client_regular", False, True, False, 0),

        # 4. Contact does not exist
        ("api_client_regular", False, False, True, None),
    ]
)
def test_contact_detail(
    request,
    user_fixture,
    other_sadc_flag,
    should_see,
    not_found,
    member_index,
    members_setup,
    other_org_setup,
):
    client = request.getfixturevalue(user_fixture)

    # Handle not found case
    if not_found:
        url = reverse("contact", args=[9999])  # Non-existent ID
        response = client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND
        return

    # Pick member based on flag
    if other_sadc_flag:
        member = other_org_setup["other_member"]
    else:
        member = members_setup["members"][member_index]

    # Create contact linked to that member
    contact = Contact.objects.create(
        name="Detail Contact",
        phone="1112223333",
        contact_type=Contact.HOME_AID
    )
    contact.members.add(member)

    url = reverse("contact", args=[contact.id])
    response = client.get(url)

    if should_see:
        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == contact.id
        assert response.data["name"] == "Detail Contact"
    else:
        assert response.status_code == status.HTTP_403_FORBIDDEN

# ==============================
# Contact Create Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,other_sadc_flag,should_create,member_index",
    [
        # 1. Admin can create contact for own SADC member
        ("api_client_admin", False, True, 0),

        # 2. Admin cannot create contact for other SADC member
        ("api_client_admin", True, False, 0),

        # 3. Regular can create contact for accessible member
        ("api_client_regular", False, True, 0),
    ]
)
def test_contact_create(
    request,
    user_fixture,
    other_sadc_flag,
    should_create,
    member_index,
    members_setup,
    other_org_setup
):
    client = request.getfixturevalue(user_fixture)

    # Pick member
    if other_sadc_flag:
        member = other_org_setup["other_member"]
    else:
        member = members_setup["members"][member_index]

    url = reverse("contacts")
    payload = {
        "name": "Alice",
        "phone": "1112223333",
        "contact_type": Contact.EMERGENCY,
        "relationship_type": Contact.WIFE,
        "members": [member.id],
    }

    response = client.post(url, data=payload)

    if should_create:
        assert response.status_code == status.HTTP_201_CREATED
        contact = Contact.objects.get(name="Alice")
        assert contact.members.filter(id=member.id).exists()
    else:
        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert not Contact.objects.filter(name="Alice").exists()

# ==============================
# Contact Update Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,other_sadc_flag,should_update,member_index",
    [
        # 1. Admin can update contact for own SADC member
        ("api_client_admin", False, True, 0),

        # 2. Admin cannot update contact for other SADC member
        ("api_client_admin", True, False, 0),

        # 3. Regular can update contact for accessible member
        ("api_client_regular", False, True, 0),
    ]
)
def test_contact_update(
    request,
    user_fixture,
    other_sadc_flag,
    should_update,
    member_index,
    members_setup,
    other_org_setup
):
    client = request.getfixturevalue(user_fixture)

    # Pick member
    if other_sadc_flag:
        member = other_org_setup["other_member"]
    else:
        member = members_setup["members"][member_index]

    # Create contact
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

    response = client.put(url, data=payload, format="json")

    if should_update:
        assert response.status_code == status.HTTP_200_OK
        contact.refresh_from_db()
        assert contact.name == "David Updated"
    else:
        assert response.status_code == status.HTTP_403_FORBIDDEN

# ==============================
# Contact Delete Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,other_sadc_flag,member_index,members_to_add,should_delete_contact",
    [
        # 1. Admin deletes last member -> contact deleted
        ("api_client_admin", False, 0, [0], True),

        # 2. Admin deletes member (multi-member) -> association deleted
        ("api_client_admin", False, 0, [0,1], False),

        # 3. Admin deletes last member of other SADC -> forbidden
        ("api_client_admin", True, 0, [0], None),

        # 4. Admin deletes member of other SADC (multi-member) -> forbidden
        ("api_client_admin", True, 0, [0,1], None),

        # 5. Regular deletes last member -> contact deleted
        ("api_client_regular", False, 0, [0], True),
        
        # 6. Regular deletes member (multi-member) -> association deleted
        ("api_client_regular", False, 0, [0,1], False),
    ]
)
def test_contact_delete(
    request,
    user_fixture,
    other_sadc_flag,
    member_index,
    members_to_add,
    should_delete_contact,
    members_setup,
    other_org_setup
):
    client = request.getfixturevalue(user_fixture)

    # Pick member to delete
    if other_sadc_flag:
        member = other_org_setup["other_member"]
    else:
        member = members_setup["members"][member_index]

    # Create contact and add members
    contact_members = []
    for i in members_to_add:
        if other_sadc_flag:
            # If any member in other SADC, create a separate contact for that SADC
            contact_members.append(other_org_setup["other_member"])
        else:
            contact_members.append(members_setup["members"][i])

    contact = Contact.objects.create(
        name="Bob Combined",
        phone="9998887777",
        contact_type=Contact.PHARMACY
    )
    contact.members.add(*contact_members)

    url = reverse("contact_with_member", args=[contact.id, member.id])
    response = client.delete(url)

    if should_delete_contact is True:
        # Last member deleted -> contact gone
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Contact.objects.filter(id=contact.id).exists()
    elif should_delete_contact is False:
        # Multi-member -> association removed only
        assert response.status_code == status.HTTP_200_OK
        contact.refresh_from_db()
        assert member not in contact.members.all()
        for m in contact_members:
            if m != member:
                assert m in contact.members.all()
        assert Contact.objects.filter(id=contact.id).exists()
    else:
        assert response.status_code == status.HTTP_403_FORBIDDEN

# ==============================
# Contact Search Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,member_index,search_name,expected_count",
    [
        # 1. Admin searches for exact name match
        ("api_client_admin", 0, "Bob", 1),
        # 2. Admin searches for partial name match
        ("api_client_admin", 0, "Bo", 1),
        # 3. Admin searches for non-existent name
        ("api_client_admin", 0, "Nonexistent", 0),
        # 4. Regular searches for exact name
        ("api_client_regular", 1, "Bob", 1),
        # 5. Regular searches for non-existent name
        ("api_client_regular", 1, "Alice", 0),
    ]
)
def test_contact_search(
    request,
    user_fixture,
    member_index,
    search_name,
    expected_count,
    members_setup,
    admin_user,
    regular_user
):
    # Get client and corresponding user
    client = request.getfixturevalue(user_fixture)
    user_map = {
        "api_client_admin": admin_user,
        "api_client_regular": regular_user,
    }
    current_user = user_map[user_fixture]

    # Create a contact for testing
    member = members_setup["members"][member_index]
    contact = Contact.objects.create(
        name="Bob",
        phone="9998887777",
        contact_type=Contact.PHARMACY
    )
    contact.members.add(member)

    url = reverse("contact_search")
    response = client.get(url, {"name": search_name})

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == expected_count

    if expected_count > 0:
        for c in response.data:
            # Name contains search query
            assert search_name.lower() in c["name"].lower()
            # Ensure contact members belong to the same SADC as current user
            for m_id in c["members"]:
                member_obj = Member.objects.get(id=m_id)
                assert member_obj.sadc == current_user.sadc

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