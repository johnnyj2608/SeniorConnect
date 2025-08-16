import pytest
from django.urls import reverse
from backend.apps.tenant.models.mltc_model import Mltc
import json

# ==============================
# MLTC Listing Tests
# ==============================

@pytest.mark.django_db
def test_get_mltc_list_as_regular_user(api_client_regular, org_setup):
    """
    Regular user should only see MLTCs they are allowed to access.
    """
    mltc_allowed = org_setup['mltc_allowed']
    url = reverse("mltcs")
    resp = api_client_regular.get(url)

    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["name"] == mltc_allowed.name

@pytest.mark.django_db
def test_get_mltc_list_as_admin(api_client_admin, org_setup):
    """
    Admin sees all MLTCs for their SADC.
    """
    mltc_allowed = org_setup['mltc_allowed']
    url = reverse("mltcs")
    resp = api_client_admin.get(url)

    assert resp.status_code == 200
    data = resp.json()
    assert any(item["name"] == mltc_allowed.name for item in data)

@pytest.mark.django_db
def test_regular_user_cannot_access_other_sadc_mltc(api_client_regular, other_org_setup):
    """
    Regular user should NOT see MLTCs from another SADC.
    """
    other_mltc_allowed = other_org_setup['other_mltc_allowed']
    other_mltc_denied = other_org_setup['other_mltc_denied']

    url = reverse("mltcs")
    resp = api_client_regular.get(url)

    assert resp.status_code == 200
    data = resp.json()
    assert all(item["name"] not in [other_mltc_allowed.name, other_mltc_denied.name] for item in data)


# ==============================
# MLTC Detail Tests
# ==============================

@pytest.mark.django_db
def test_get_mltc_detail_forbidden_for_regular_user(api_client_regular, org_setup):
    mltc_denied = org_setup['mltc_denied']
    url = reverse("mltc", args=[mltc_denied.id])
    resp = api_client_regular.get(url)
    assert resp.status_code == 403

@pytest.mark.django_db
def test_get_mltc_detail_success_for_allowed_regular_user(api_client_regular, org_setup):
    mltc_allowed = org_setup['mltc_allowed']
    url = reverse("mltc", args=[mltc_allowed.id])
    resp = api_client_regular.get(url)
    assert resp.status_code == 200
    assert resp.data["name"] == mltc_allowed.name

@pytest.mark.django_db
def test_get_mltc_detail_success_for_admin(api_client_admin, org_setup):
    mltc_allowed = org_setup['mltc_allowed']
    url = reverse("mltc", args=[mltc_allowed.id])
    resp = api_client_admin.get(url)
    assert resp.status_code == 200
    assert resp.data["name"] == mltc_allowed.name


# ==============================
# MLTC Creation Tests
# ==============================

@pytest.mark.django_db
def test_create_mltc_forbidden_for_regular_user(api_client_regular):
    url = reverse("mltcs")
    new_data = {
        "name": "New MLTC",
        "dx_codes": json.dumps(["DX3"])
    }
    resp = api_client_regular.post(url, data=new_data, format="multipart")

    assert resp.status_code == 403
    assert "detail" in resp.data

@pytest.mark.django_db
def test_create_mltc_success_for_admin(api_client_admin):
    url = reverse("mltcs")
    new_data = {
        "name": "New MLTC",
        "dx_codes": json.dumps(["DX3", "DX4"])
    }
    resp = api_client_admin.post(url, data=new_data, format="multipart")

    assert resp.status_code == 201
    assert resp.data["name"] == "New MLTC"

@pytest.mark.django_db
def test_create_mltc_invalid_data(api_client_admin):
    url = reverse("mltcs")
    invalid_data = {"dx_codes": json.dumps([])}  # Missing 'name'
    resp = api_client_admin.post(url, data=invalid_data, format="multipart")

    assert resp.status_code == 400
    assert "name" in resp.data


# ==============================
# MLTC Update Tests
# ==============================

@pytest.mark.django_db
def test_update_mltc_forbidden_for_regular_user(api_client_regular, org_setup):
    mltc_allowed = org_setup['mltc_allowed']
    url = reverse("mltc", args=[mltc_allowed.id])
    update_data = {"name": "Updated", "dx_codes": json.dumps(["DX1"])}
    resp = api_client_regular.put(url, data=update_data, format="multipart")
    assert resp.status_code == 403

@pytest.mark.django_db
def test_update_mltc_success_for_admin(api_client_admin, org_setup):
    mltc_allowed = org_setup['mltc_allowed']
    url = reverse("mltc", args=[mltc_allowed.id])
    update_data = {"name": "Updated", "dx_codes": json.dumps(["DX1"])}
    resp = api_client_admin.put(url, data=update_data, format="multipart")
    assert resp.status_code == 200
    assert resp.data["name"] == "Updated"

@pytest.mark.django_db
def test_update_mltc_invalid_data(api_client_admin, org_setup):
    mltc_allowed = org_setup['mltc_allowed']
    url = reverse("mltc", args=[mltc_allowed.id])
    invalid_data = {"name": "", "dx_codes": json.dumps(["DX1"])}
    resp = api_client_admin.put(url, data=invalid_data, format="multipart")
    assert resp.status_code == 400
    assert "name" in resp.data

@pytest.mark.django_db
def test_regular_user_cannot_update_disallowed_mltc(api_client_regular, org_setup):
    mltc_denied = org_setup['mltc_denied']
    url = reverse("mltc", args=[mltc_denied.id])
    update_data = {"name": "Hacked Name", "dx_codes": json.dumps(["DX3"])}
    resp = api_client_regular.put(url, data=update_data, format="multipart")
    assert resp.status_code == 403


# ==============================
# MLTC Deletion Tests
# ==============================

@pytest.mark.django_db
def test_delete_mltc_forbidden_for_regular_user(api_client_regular, org_setup):
    mltc_allowed = org_setup['mltc_allowed']
    url = reverse("mltc", args=[mltc_allowed.id])
    resp = api_client_regular.delete(url)
    assert resp.status_code == 403

@pytest.mark.django_db
def test_delete_mltc_success_for_admin(api_client_admin, org_setup):
    mltc_allowed = org_setup['mltc_allowed']
    url = reverse("mltc", args=[mltc_allowed.id])
    resp = api_client_admin.delete(url)
    assert resp.status_code == 204
    assert not Mltc.objects.filter(id=mltc_allowed.id).exists()
