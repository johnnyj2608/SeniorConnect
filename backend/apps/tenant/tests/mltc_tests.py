import pytest
from django.urls import reverse
from rest_framework import status
from backend.apps.tenant.models.mltc_model import Mltc
import json

# ==============================
# MLTC List Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,fixture_key,other_sadc_flag,should_see",
    [
        # Admin sees MLTCs in own SADC
        ("api_client_admin", "mltc_allowed", False, True),
        # Admin cannot see MLTCs in other SADC
        ("api_client_admin", "mltc_allowed", True, False),
        # Regular user sees allowed MLTC
        ("api_client_regular", "mltc_allowed", False, True),
        # Regular user cannot see denied MLTC
        ("api_client_regular", "mltc_denied", False, False),
    ]
)
def test_mltc_list(
    request,
    org_setup,
    other_org_setup,
    user_fixture,
    fixture_key,
    other_sadc_flag,
    should_see,
):
    client = request.getfixturevalue(user_fixture)

    if other_sadc_flag:
        # match naming between org_setup & other_org_setup
        key_map = {
            "mltc_allowed": "other_mltc_allowed",
            "mltc_denied": "other_mltc_denied",
        }
        mltc = other_org_setup[key_map[fixture_key]]
    else:
        mltc = org_setup[fixture_key]

    url = reverse("mltcs")
    resp = client.get(url)
    assert resp.status_code == status.HTTP_200_OK

    names = [m["name"] for m in resp.json()]
    if should_see:
        assert mltc.name in names
    else:
        assert mltc.name not in names

# ==============================
# MLTC Detail Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,mltc_attr,other_sadc_flag,should_see,nonexistent",
    [
        # Admin sees MLTC in own SADC
        ("api_client_admin", "mltc_allowed", False, True, False),
        # Admin cannot see MLTC in other SADC
        ("api_client_admin", "other_mltc_allowed", True, False, False),
        # Regular user sees allowed MLTC
        ("api_client_regular", "mltc_allowed", False, True, False),
        # Regular user cannot see denied MLTC
        ("api_client_regular", "mltc_denied", False, False, False),
        # Nonexistent MLTC should return 404
        ("api_client_admin", None, False, False, True),
    ]
)
def test_mltc_detail(
    request,
    org_setup,
    other_org_setup,
    user_fixture,
    mltc_attr,
    other_sadc_flag,
    should_see,
    nonexistent
):
    client = request.getfixturevalue(user_fixture)

    if nonexistent:
        url = reverse("mltc", args=[999999])  # ID that does not exist
        resp = client.get(url)
        assert resp.status_code == status.HTTP_404_NOT_FOUND
        return

    # Determine which MLTC to use
    if other_sadc_flag:
        mltc_obj = other_org_setup["other_mltc_allowed"]
    else:
        mltc_obj = org_setup[mltc_attr]

    url = reverse("mltc", args=[mltc_obj.id])
    resp = client.get(url)

    if should_see:
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json()["name"] == mltc_obj.name
    else:
        assert resp.status_code == status.HTTP_404_NOT_FOUND


# ==============================
# MLTC Create Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,mltc_name,expected_status",
    [
        # Admin creating a valid MLTC
        ("api_client_admin", "New MLTC Admin", status.HTTP_201_CREATED),
        # Regular can not create an MLTC
        ("api_client_regular", "New MLTC Regular", status.HTTP_404_NOT_FOUND),
    ]
)
def test_mltc_create(request, user_fixture, mltc_name, expected_status):
    client = request.getfixturevalue(user_fixture)

    # Keep payload construction exactly like your working code
    new_data = {
        "name": mltc_name,
        "dx_codes": json.dumps(["DX3", "DX4"])
    }

    url = reverse("mltcs")
    resp = client.post(url, data=new_data, format="multipart")

    assert resp.status_code == expected_status

    if expected_status == status.HTTP_201_CREATED:
        assert resp.data["name"] == mltc_name


# ==============================
# MLTC Update Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,new_name,expected_status",
    [
        # Admin can update
        ("api_client_admin", "Updated by Admin", status.HTTP_200_OK),
        # Regular user cannot update
        ("api_client_regular", "Attempted by Regular", status.HTTP_404_NOT_FOUND),
    ]
)
def test_mltc_update(request, org_setup, user_fixture, new_name, expected_status):
    client = request.getfixturevalue(user_fixture)
    mltc_obj = org_setup['mltc_allowed']
    url = reverse("mltc", args=[mltc_obj.id])

    payload = {
        "name": new_name,
       "dx_codes": json.dumps(["DX1"])
    }

    resp = client.put(url, data=payload, format="multipart")
    assert resp.status_code == expected_status

    if expected_status == status.HTTP_200_OK:
        mltc_obj.refresh_from_db()
        assert mltc_obj.name == new_name
        assert mltc_obj.dx_codes == ["DX1"]

# # ==============================
# # MLTC Deletion Tests
# # ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,expected_status",
    [
        # Admin can delete
        ("api_client_admin", status.HTTP_204_NO_CONTENT),  
        # Regular can not delete
        ("api_client_regular", status.HTTP_404_NOT_FOUND), 
    ]
)
def test_delete_mltc(request, org_setup, user_fixture, expected_status):
    client = request.getfixturevalue(user_fixture)
    mltc_obj = org_setup['mltc_allowed']
    url = reverse("mltc", args=[mltc_obj.id])

    resp = client.delete(url)

    assert resp.status_code == expected_status

    if expected_status == status.HTTP_204_NO_CONTENT:
        assert not Mltc.objects.filter(id=mltc_obj.id).exists()
    else:
        assert Mltc.objects.filter(id=mltc_obj.id).exists()