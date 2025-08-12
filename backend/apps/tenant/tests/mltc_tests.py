import pytest
from django.urls import reverse
from backend.apps.tenant.models.mltc_model import Mltc
import json

@pytest.mark.django_db
def test_get_mltc_list_as_regular_user(api_client, org_setup, regular_user):
    """
    Test that a regular user only sees MLTCs they are allowed to access.
    """
    mltc_allowed = org_setup['mltc_allowed']
    api_client.force_authenticate(user=regular_user)

    url = reverse("mltcs")
    resp = api_client.get(url)

    assert resp.status_code == 200
    data = resp.json()
    # Regular user should only get the allowed MLTC
    assert len(data) == 1
    assert data[0]["name"] == mltc_allowed.name

@pytest.mark.django_db
def test_get_mltc_list_as_admin(api_client, org_setup, admin_user):
    """
    Test that admin user sees all MLTCs for their Sadc.
    """
    mltc_allowed = org_setup['mltc_allowed']
    api_client.force_authenticate(user=admin_user)

    url = reverse("mltcs")
    resp = api_client.get(url)

    assert resp.status_code == 200
    data = resp.json()
    # Admin sees all MLTCs (at least the allowed one)
    assert any(item["name"] == mltc_allowed.name for item in data)

@pytest.mark.django_db
def test_create_mltc_forbidden_for_regular_user(api_client, regular_user):
    """
    Verify regular user cannot create new MLTC.
    Should return 403 Forbidden.
    """
    api_client.force_authenticate(user=regular_user)

    url = reverse("mltcs")
    new_data = {"name": "New MLTC", "dx_codes": ["DX3"]}
    resp = api_client.post(url, new_data, format="json")

    assert resp.status_code == 403
    assert "detail" in resp.data

@pytest.mark.django_db
def test_create_mltc_success_for_admin(api_client, admin_user):
    """
    Verify admin user can create new MLTC successfully.
    Send 'dx_codes' as JSON string because view expects form-data.
    """
    api_client.force_authenticate(user=admin_user)
    url = reverse("mltcs")

    new_data = {
        "name": "New MLTC",
        "dx_codes": json.dumps(["DX3", "DX4"]) 
    }
    resp = api_client.post(url, data=new_data, format="multipart")

    assert resp.status_code == 201
    assert resp.data["name"] == "New MLTC"

@pytest.mark.django_db
def test_update_mltc_forbidden_for_regular_user(api_client, org_setup, regular_user):
    """
    Verify regular user cannot update MLTC.
    """
    mltc_allowed = org_setup['mltc_allowed']
    api_client.force_authenticate(user=regular_user)

    url = reverse("mltc", args=[mltc_allowed.id])
    resp = api_client.put(url, {"name": "Updated"}, format="json")

    assert resp.status_code == 403

@pytest.mark.django_db
def test_update_mltc_success_for_admin(api_client, admin_user, org_setup):
    """
    Verify admin user can update MLTC details successfully.
    """
    mltc_allowed = org_setup['mltc_allowed']
    api_client.force_authenticate(user=admin_user)

    url = reverse("mltc", args=[mltc_allowed.id])
    resp = api_client.put(url, {"name": "Updated", "dx_codes": ["DX1"]}, format="json")

    assert resp.status_code == 200
    assert resp.data["name"] == "Updated"

@pytest.mark.django_db
def test_delete_mltc_forbidden_for_regular_user(api_client, regular_user, org_setup):
    """
    Verify regular user cannot delete an MLTC.
    """
    mltc_allowed = org_setup['mltc_allowed']
    api_client.force_authenticate(user=regular_user)

    url = reverse("mltc", args=[mltc_allowed.id])
    resp = api_client.delete(url)

    assert resp.status_code == 403

@pytest.mark.django_db
def test_delete_mltc_success_for_admin(api_client, admin_user, org_setup):
    """
    Verify admin user can delete MLTC successfully.
    """
    mltc_allowed = org_setup['mltc_allowed']
    api_client.force_authenticate(user=admin_user)

    url = reverse("mltc", args=[mltc_allowed.id])
    resp = api_client.delete(url)

    assert resp.status_code == 204
    assert not Mltc.objects.filter(id=mltc_allowed.id).exists()

@pytest.mark.django_db
def test_regular_user_cannot_update_disallowed_mltc(api_client, regular_user, org_setup):
    """
    Verify a regular user allowed only on 'mltc_allowed' cannot update 'mltc_denied'.
    """
    mltc_denied = org_setup['mltc_denied']
    api_client.force_authenticate(user=regular_user)

    update_url = reverse("mltc", args=[mltc_denied.id])
    update_resp = api_client.put(update_url, {"name": "Hacked Name"}, format="json")
    assert update_resp.status_code == 403

@pytest.mark.django_db
def test_regular_user_cannot_delete_disallowed_mltc(api_client, regular_user, org_setup):
    """
    Verify a regular user allowed only on 'mltc_allowed' cannot delete 'mltc_denied'.
    """
    mltc_denied = org_setup['mltc_denied']
    api_client.force_authenticate(user=regular_user)

    delete_url = reverse("mltc", args=[mltc_denied.id])
    delete_resp = api_client.delete(delete_url)
    assert delete_resp.status_code == 403
