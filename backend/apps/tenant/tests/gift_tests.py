import pytest
from django.urls import reverse
from rest_framework import status
from backend.apps.tenant.models.gift_model import Gift
from backend.apps.core.models.gifted_model import Gifted
from backend.utils.snapshot_utils import gifts_received_query, gifts_unreceived_query

# ==============================
# Gift List Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,gift_name,mltc_attr,other_sadc_flag,should_see",
    [
        # Admin sees gifts in own SADC
        ("api_client_admin", "Gift Admin Own", "mltc_allowed", False, True),
        # Admin cannot see gifts in other SADC
        ("api_client_admin", "Gift Admin Other", "mltc_allowed", True, False),
        # Regular user sees allowed MLTC gift
        ("api_client_regular", "Gift Regular Allowed", "mltc_allowed", False, True),
        # Regular user cannot see denied MLTC gift
        ("api_client_regular", "Gift Regular Denied", "mltc_denied", False, False),
    ]
)
def test_gift_list(
    request,
    org_setup,
    other_org_setup,
    user_fixture,
    gift_name,
    mltc_attr,
    other_sadc_flag,
    should_see
):
    # Determine which SADC and MLTC to use
    if other_sadc_flag:
        sadc = other_org_setup['other_sadc']
        mltc_obj = other_org_setup['other_mltc_allowed']
    else:
        sadc = org_setup['sadc']
        mltc_obj = org_setup.get(mltc_attr, None)

    # Create the gift
    Gift.objects.create(name=gift_name, sadc=sadc, mltc=mltc_obj)

    # Get the API client
    client = request.getfixturevalue(user_fixture)
    url = reverse("gifts")
    resp = client.get(url)
    assert resp.status_code == 200

    data_names = [g["name"] for g in resp.json()]
    if should_see:
        assert gift_name in data_names
    else:
        assert gift_name not in data_names

# ==============================
# Gift Detail Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,gift_name,mltc_attr,other_sadc_flag,should_see,nonexistent",
    [
        # Admin sees gifts in own SADC
        ("api_client_admin", "Gift Admin Own", "mltc_allowed", False, True, False),
        # Admin cannot see gifts in other SADC
        ("api_client_admin", "Gift Admin Other", "mltc_allowed", True, False, False),
        # Regular user sees allowed MLTC gift
        ("api_client_regular", "Gift Regular Allowed", "mltc_allowed", False, True, False),
        # Regular user cannot see denied MLTC gift
        ("api_client_regular", "Gift Regular Denied", "mltc_denied", False, False, False),
        # Nonexistent gift should return 404
        ("api_client_admin", None, None, False, False, True),
    ]
)
def test_gift_detail(
    request,
    org_setup,
    other_org_setup,
    user_fixture,
    gift_name,
    mltc_attr,
    other_sadc_flag,
    should_see,
    nonexistent
):
    client = request.getfixturevalue(user_fixture)

    if nonexistent:
        url = reverse("gift", args=[999999])  # fake ID
        resp = client.get(url)
        assert resp.status_code == status.HTTP_404_NOT_FOUND
        return

    # Determine which SADC and MLTC to use
    if other_sadc_flag:
        sadc = other_org_setup['other_sadc']
        mltc_obj = other_org_setup['other_mltc_allowed']
    else:
        sadc = org_setup['sadc']
        mltc_obj = org_setup.get(mltc_attr, None)

    # Create the gift
    gift = Gift.objects.create(name=gift_name, sadc=sadc, mltc=mltc_obj)

    url = reverse("gift", args=[gift.id])
    resp = client.get(url)

    if should_see:
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json()["name"] == gift_name
    else:
        assert resp.status_code == status.HTTP_404_NOT_FOUND

# ==============================
# Gift Create Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,gift_name,mltc_attr,other_sadc_flag,birth_month,should_succeed",
    [
        # Admin can create gift in own SADC
        ("api_client_admin", "Gift Admin Own", "mltc_allowed", False, 5, True),
        # Admin cannot create gift in other SADC (should fail if we tried other SADC)
        ("api_client_admin", "Gift Admin Other", "mltc_allowed", True, 5, False),
        # Regular user can create allowed MLTC gift
        ("api_client_regular", "Gift Regular Allowed", "mltc_allowed", False, 5, True),
        # Regular user cannot create denied MLTC gift
        ("api_client_regular", "Gift Regular Denied", "mltc_denied", False, 5, False),
        # Fail if birth month is invalid
        ("api_client_regular", "Gift Invalid Month", "mltc_allowed", False, 13, False),
        ("api_client_regular", "Gift Invalid Month", "mltc_allowed", False, 0, False),
        ("api_client_regular", "Gift Invalid Month", "mltc_allowed", False, -1, False),
    ]
)
def test_gift_create(
    request, 
    org_setup, 
    other_org_setup, 
    user_fixture, 
    gift_name, 
    mltc_attr, 
    other_sadc_flag,
    birth_month,
    should_succeed
):
    # Determine which SADC and MLTC to use
    if other_sadc_flag:
        sadc = other_org_setup['other_sadc']
        mltc_obj = other_org_setup['other_mltc_allowed']
    else:
        sadc = org_setup['sadc']
        mltc_obj = org_setup.get(mltc_attr, None)

    # Prepare POST data
    new_data = {
        "name": gift_name,
        "mltc": mltc_obj.name if mltc_obj else None,
        "birth_month": birth_month,
    }

    client = request.getfixturevalue(user_fixture)
    url = reverse("gifts")
    resp = client.post(url, new_data, format="json")

    if should_succeed:
        assert resp.status_code == status.HTTP_201_CREATED
        assert resp.data["name"] == gift_name
        assert resp.data.get("birth_month") == birth_month
        if mltc_obj:
            assert resp.data["mltc"] == mltc_obj.name
        else:
            assert resp.data["mltc"] is None
    else:
        if birth_month < 1 or birth_month > 12:
            # Invalid birth month → 400
            assert resp.status_code == status.HTTP_400_BAD_REQUEST
        else:
            # Unauthorized MLTC/SADC → 403
            assert resp.status_code == status.HTTP_404_NOT_FOUND

# ==============================
# Gift Update Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,gift_name,mltc_attr,other_sadc_flag,birth_month,should_succeed,gift_exists",
    [
        # Admin can update gift in own SADC
        ("api_client_admin", "Gift Admin Own", "mltc_allowed", False, 5, True, True),
        # Admin cannot update gift in other SADC
        ("api_client_admin", "Gift Admin Other", "mltc_allowed", True, 5, False, True),
        # Regular user can update allowed MLTC gift
        ("api_client_regular", "Gift Regular Allowed", "mltc_allowed", False, 5, True, True),
        # Regular user cannot update denied MLTC gift
        ("api_client_regular", "Gift Regular Denied", "mltc_denied", False, 5, False, True),
        # Non-existent gift → 404
        ("api_client_admin", "Nonexistent Gift", "mltc_allowed", False, 5, False, False),
        # Invalid birth months (should fail with 400)
        ("api_client_regular", "Gift Invalid Month", "mltc_allowed", False, 13, False, True),
        ("api_client_regular", "Gift Invalid Month", "mltc_allowed", False, 0, False, True),
        ("api_client_regular", "Gift Invalid Month", "mltc_allowed", False, -1, False, True),
        
    ]
)
def test_gift_update(
    request, 
    org_setup, 
    other_org_setup, 
    user_fixture, 
    gift_name, 
    mltc_attr, 
    other_sadc_flag,
    birth_month,
    should_succeed,
    gift_exists
):
    client = request.getfixturevalue(user_fixture)

    if gift_exists:
        # Determine which SADC and MLTC to use
        if other_sadc_flag:
            sadc = other_org_setup['other_sadc']
            mltc_obj = other_org_setup['other_mltc_allowed']
        else:
            sadc = org_setup['sadc']
            mltc_obj = org_setup.get(mltc_attr, None)

        # Create gift to update
        gift = Gift.objects.create(
            name="Original Gift",
            sadc=sadc,
            mltc=mltc_obj
        )
        gift_id = gift.id
    else:
        gift_id = 9999  # Non-existent gift ID

    # Prepare PUT data
    update_data = {
        "name": gift_name,
        "mltc": mltc_obj.name if gift_exists and mltc_obj else None,
        "birth_month": birth_month,
    }

    url = reverse("gift", args=[gift_id])
    resp = client.put(url, update_data, format="json")

    if not gift_exists:
        assert resp.status_code == status.HTTP_404_NOT_FOUND
    elif should_succeed:
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["name"] == gift_name
        assert resp.data.get("birth_month") == birth_month
        if mltc_obj:
            assert resp.data["mltc"] == mltc_obj.name
        else:
            assert resp.data["mltc"] is None
    else:
        if birth_month < 1 or birth_month > 12:
            # Invalid birth month → 400
            assert resp.status_code == status.HTTP_400_BAD_REQUEST
        else:
            # Unauthorized MLTC/SADC → 403
            assert resp.status_code == status.HTTP_404_NOT_FOUND

# ==============================
# Gift Delete Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,gift_name,mltc_attr,other_sadc_flag,should_succeed,gift_exists",
    [
        # Admin can delete gift in own SADC
        ("api_client_admin", "Admin Own Gift", "mltc_allowed", False, True, True),
        # Admin cannot delete gift in other SADC
        ("api_client_admin", "Admin Other Gift", "mltc_allowed", True, False, True),
        # Regular user can delete allowed MLTC gift
        ("api_client_regular", "Regular Allowed Gift", "mltc_allowed", False, True, True),
        # Regular user cannot delete denied MLTC gift
        ("api_client_regular", "Regular Denied Gift", "mltc_denied", False, False, True),
        # Non-existent gift → 404
        ("api_client_admin", "Nonexistent Gift", "mltc_allowed", False, False, False),
    ]
)
def test_gift_delete(
    request,
    org_setup,
    other_org_setup,
    user_fixture,
    gift_name,
    mltc_attr,
    other_sadc_flag,
    should_succeed,
    gift_exists
):
    client = request.getfixturevalue(user_fixture)

    if gift_exists:
        # Determine which SADC and MLTC to use
        if other_sadc_flag:
            sadc = other_org_setup['other_sadc']
            mltc_obj = other_org_setup['other_mltc_allowed']
        else:
            sadc = org_setup['sadc']
            mltc_obj = org_setup.get(mltc_attr, None)

        # Create gift to delete
        gift = Gift.objects.create(
            name=gift_name,
            sadc=sadc,
            mltc=mltc_obj
        )
        gift_id = gift.id
    else:
        gift_id = 9999  # Non-existent ID

    url = reverse("gift", args=[gift_id])
    resp = client.delete(url)

    if not gift_exists:
        assert resp.status_code == status.HTTP_404_NOT_FOUND
    elif should_succeed:
        assert resp.status_code == status.HTTP_204_NO_CONTENT
        assert not Gift.objects.filter(id=gift_id).exists()
    else:
        assert resp.status_code == status.HTTP_404_NOT_FOUND
        assert Gift.objects.filter(id=gift_id).exists()

# ==============================
# Gift Query Tests
# ==============================

@pytest.mark.django_db
def test_gift_received(members_setup, org_setup):
    sadc = members_setup['sadc']
    m1, m2, m3, m4 = members_setup['members']

    gift = Gift.objects.create(name="Test Gift", sadc=sadc)
    
    # Only m1 has received the gift
    Gifted.objects.create(
        member=m1,
        gift_id=gift.id,
        name=gift.name,
        received=True
    )

    result = gifts_received_query(sadc, None, None, None, gift_id=gift.id)
    qs = result['members']()

    # Check title
    assert result['title'] == "Test Gift Received"

    # Check members
    gifted_list = list(qs)
    assert len(gifted_list) == 1
    gifted = gifted_list[0]
    assert gifted.member == m1
    assert gifted.gift_id == gift.id
    assert gifted.name == gift.name
    assert gifted.received is True

@pytest.mark.django_db
def test_gift_unreceived(members_setup, org_setup):
    sadc = members_setup['sadc']
    m1, m2, m3, m4 = members_setup['members']

    # Gift with no birth month and no MLTC restriction
    gift = Gift.objects.create(name="Test Gift", sadc=sadc)

    # m1 already received gift
    Gifted.objects.create(
        member=m1,
        gift_id=gift.id,
        name=gift.name,
        received=True
    )

    result = gifts_unreceived_query(sadc, None, None, None, gift_id=gift.id)
    qs = result['members']()

    # Should include only members who are active and have active_auth, and haven't received the gift
    member_ids = set(qs.values_list('id', flat=True))
    assert member_ids == {m2.id}  # m2 is active, has active_auth, not received
    assert result['title'] == "Test Gift Unreceived"