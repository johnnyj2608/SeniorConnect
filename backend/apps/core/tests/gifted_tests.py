import pytest
from rest_framework import status
from backend.apps.core.models.gifted_model import Gifted
from django.urls import reverse

# ==============================
# Gifted List Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,mltc_attr,other_sadc_flag,should_see,member_index",
    [
        # 1. Admin can get any from own SADC
        ("api_client_admin", "mltc_denied", False, True, 0),
        # 2. Admin cannot get from other SADC
        ("api_client_admin", "mltc_allowed", True, False, 0),
        # 3. Regular can get from mltc allowed
        ("api_client_regular", "mltc_allowed", False, True, 0),
        # 4. Regular cannot get from mltc denied
        ("api_client_regular", "mltc_denied", False, False, 1),
        # 5. Regular can get from member with no active authorization
        ("api_client_regular", "mltc_allowed", False, True, 2),
        # 6. Regular can get from inactive member
        ("api_client_regular", "mltc_allowed", False, True, 3),
    ]
)
def test_gifted_list(
    request,
    user_fixture,
    mltc_attr,
    other_sadc_flag,
    should_see,
    member_index,
    members_setup,
    org_setup,
    other_org_setup,
):
    client = request.getfixturevalue(user_fixture)

    # Pick member
    if other_sadc_flag:
        member = other_org_setup["other_member"]
    else:
        member = members_setup["members"][member_index]

    gifted = Gifted.objects.create(
        member=member,
        gift_id=1,
        name="Shoes",
        received=True,
    )

    url = reverse("gifteds")
    response = client.get(url)
    assert response.status_code == 200

    if should_see:
        results = response.data["results"] if "results" in response.data else response.data
        assert any(g["id"] == gifted.id for g in results)
    else:
        results = response.data["results"] if "results" in response.data else response.data
        assert all(g["id"] != gifted.id for g in results)


@pytest.mark.django_db
def test_get_gifteds_list(api_client_regular, members_setup):
    member = members_setup["members"][0]
    Gifted.objects.create(member=member, gift_id=1, name="Shoes", received=True)

    url = reverse("gifteds") 
    response = api_client_regular.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]["name"] == "Shoes"

# ==============================
# Gifted Detail Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,mltc_attr,other_sadc_flag,should_see,not_found,member_index",
    [
        # 1. Admin can get any from own SADC
        ("api_client_admin", "mltc_denied", False, True, False, 0),

        # 2. Admin cannot get from other SADC
        ("api_client_admin", "mltc_allowed", True, False, False, 0),

        # 3. Regular can get from mltc allowed
        ("api_client_regular", "mltc_allowed", False, True, False, 0),

        # 4. Regular cannot get from mltc denied
        ("api_client_regular", "mltc_denied", False, False, False, 1),

        # 5. Regular can get from member with no active authorization
        ("api_client_regular", "mltc_allowed", False, True, False, 2),

        # 6. Regular can get from inactive member
        ("api_client_regular", "mltc_allowed", False, True, False, 3),

        # 7. Gifted not found
        ("api_client_regular", "mltc_allowed", False, False, True, None),
    ]
)
def test_gifted_detail(
    request,
    user_fixture,
    mltc_attr,
    other_sadc_flag,
    should_see,
    not_found,
    member_index,
    members_setup,
    org_setup,
    other_org_setup,
):
    client = request.getfixturevalue(user_fixture)

    # Handle not found case
    if not_found:
        url = reverse("gifted", args=[9999])  # non-existent id
        response = client.get(url)
        assert response.status_code == 404
        return

    # Pick member
    if other_sadc_flag:
        member = other_org_setup["other_member"]
    else:
        member = members_setup["members"][member_index]

    gifted = Gifted.objects.create(
        member=member,
        gift_id=1,
        name="Gloves",
        received=True,
    )

    url = reverse("gifted", args=[gifted.id])
    response = client.get(url)

    if should_see:
        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == gifted.id
        assert response.data["name"] == "Gloves"
    else:
        assert response.status_code == status.HTTP_404_NOT_FOUND

@pytest.mark.django_db
def test_get_gifted_detail(api_client_regular, members_setup):
    member = members_setup["members"][0]
    gifted = Gifted.objects.create(member=member, gift_id=1, name="Gloves", received=True)

    url = reverse("gifted", args=[gifted.id])
    response = api_client_regular.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert response.data["name"] == "Gloves"

# ==============================
# Gifted Create Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,mltc_attr,other_sadc_flag,should_create,received_value",
    [
        # 1. Admin can create gifted for own SADC, received=True
        ("api_client_admin", "mltc_denied", False, True, True),

        # 2. Admin cannot create gifted for other SADC
        ("api_client_admin", "mltc_allowed", True, False, True),

        # 3. Regular can create gifted for allowed MLTC
        ("api_client_regular", "mltc_allowed", False, True, True),

        # 4. Regular cannot create gifted for denied MLTC
        ("api_client_regular", "mltc_denied", False, False, True),

        # 5. Regular tries received=False → 204 No Content
        ("api_client_regular", "mltc_allowed", False, False, False),
    ]
)
def test_gifted_create(
    request,
    user_fixture,
    mltc_attr,
    other_sadc_flag,
    should_create,
    received_value,
    members_setup,
    org_setup,
    other_org_setup,
):
    client = request.getfixturevalue(user_fixture)

    # Pick member
    if other_sadc_flag:
        member = other_org_setup["other_member"]
    else:
        member = members_setup["members"][0] if mltc_attr == "mltc_allowed" else members_setup["members"][1]

    url = reverse("gifteds")
    payload = {
        "member": member.id,
        "gift_id": 123,
        "name": "Jacket",
        "received": received_value,
    }

    response = client.post(url, data=payload, format="json")

    if received_value in ['false', False]:
        # If received is false → 204 No Content
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Gifted.objects.filter(member=member, gift_id=123).exists()
    elif should_create:
        assert response.status_code == status.HTTP_201_CREATED
        assert Gifted.objects.filter(member=member, gift_id=123).exists()
    else:
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert not Gifted.objects.filter(member=member, gift_id=123).exists()


# ==============================
# Gifted Update Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,mltc_attr,other_sadc_flag,should_update,received_value,not_found",
    [
        # 1. Admin updates gifted for own SADC, received=True
        ("api_client_admin", "mltc_denied", False, True, True, False),

        # 2. Admin cannot update gifted in other SADC
        ("api_client_admin", "mltc_allowed", True, False, True, False),

        # 3. Regular updates allowed MLTC, received=True
        ("api_client_regular", "mltc_allowed", False, True, True, False),

        # 4. Regular cannot update denied MLTC
        ("api_client_regular", "mltc_denied", False, False, True, False),

        # 5. Regular updates but sets received=False → 204 No Content
        ("api_client_regular", "mltc_allowed", False, False, False, False),

        # 6. Gifted not found
        ("api_client_regular", "mltc_allowed", False, False, True, True),
    ]
)
def test_gifted_update(
    request,
    user_fixture,
    mltc_attr,
    other_sadc_flag,
    should_update,
    received_value,
    not_found,
    members_setup,
    org_setup,
    other_org_setup,
):
    client = request.getfixturevalue(user_fixture)

    # Pick member
    if other_sadc_flag:
        member = other_org_setup["other_member"]
    else:
        member = members_setup["members"][0] if mltc_attr == "mltc_allowed" else members_setup["members"][1]

    # Create initial gifted unless testing not found
    if not not_found:
        gifted = Gifted.objects.create(member=member, gift_id=123, name="Gloves", received=True)
        gifted_id = gifted.id
    else:
        gifted_id = 9999  # non-existent

    url = reverse("gifted", args=[gifted_id])
    payload = {
        "member": member.id,
        "gift_id": 123,
        "name": "Updated Gloves",
        "received": received_value,
    }

    response = client.put(url, data=payload, format="json")

    if not_found:
        assert response.status_code == status.HTTP_404_NOT_FOUND
    elif received_value in ['false', False]:
        # received=False → delete the object
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Gifted.objects.filter(id=gifted_id).exists()
    elif should_update:
        assert response.status_code == status.HTTP_200_OK
        updated = Gifted.objects.get(id=gifted_id)
        assert updated.name == "Updated Gloves"
    else:
        # Not authorized to update
        assert response.status_code == status.HTTP_404_NOT_FOUND
        unchanged = Gifted.objects.get(id=gifted_id)
        assert unchanged.name == "Gloves"


# ==============================
# Gifted Member Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,member_index,mltc_attr,expected_status",
    [
        # 1. Admin can get any from own SADC
        ("api_client_admin", 1, "mltc_denied", status.HTTP_200_OK),

        # 2. Admin cannot get from other SADC
        ("api_client_admin", "other", "mltc_allowed", status.HTTP_404_NOT_FOUND),

        # 3. Regular can get from MLTC allowed
        ("api_client_regular", 0, "mltc_allowed", status.HTTP_200_OK),

        # 4. Regular cannot get from MLTC denied
        ("api_client_regular", 1, "mltc_denied", status.HTTP_404_NOT_FOUND),

        # 5. Regular can see member with no active authorization
        ("api_client_regular", 2, None, status.HTTP_200_OK),

        # 6. Regular can see inactive member
        ("api_client_regular", 3, None, status.HTTP_200_OK),
    ]
)
def test_gifted_member(
    request,
    user_fixture,
    member_index,
    mltc_attr,
    expected_status,
    members_setup,
    org_setup,
    other_org_setup
):
    client = request.getfixturevalue(user_fixture)

    # Pick member
    if member_index == "other":
        member = other_org_setup["other_member"]
    else:
        member = members_setup["members"][member_index]

    # Create some Gifted entries for the member
    Gifted.objects.create(member=member, gift_id=1, name="Shoes", received=True)
    Gifted.objects.create(member=member, gift_id=2, name="Hat", received=True)

    url = reverse("gifted_by_member", args=[member.id])
    response = client.get(url)

    # Check status code
    assert response.status_code == expected_status

    # If 200 OK, response should always be a list of gifted objects
    if expected_status == status.HTTP_200_OK:
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 2
        names = [gift["name"] for gift in data]
        assert "Shoes" in names and "Hat" in names