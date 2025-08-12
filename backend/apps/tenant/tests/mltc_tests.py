import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from backend.apps.tenant.models.mltc_model import Mltc
from backend.apps.tenant.models.sadc_model import Sadc
from django.contrib.auth import get_user_model
import json

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def sadc_and_mltc(db):
    """
    Creates a test Sadc instance and an associated MLTC instance.
    Returns both for use in tests.
    """
    sadc = Sadc.objects.create(
        name="Test SADC",
        email="test@sadc.com",
        phone="1234567890",
        address="123 Main St",
        npi="1234567890",
        attendance_template=1,
        languages=["English"],
    )
    mltc = Mltc.objects.create(
        sadc=sadc,
        name="Allowed MLTC",
        dx_codes=["DX1", "DX2"],
    )
    return sadc, mltc

@pytest.fixture
def admin_user(sadc_and_mltc):
    """
    Creates an admin user associated with the Sadc.
    Admin user can perform all MLTC operations.
    """
    sadc, _ = sadc_and_mltc
    return User.objects.create_user(
        email="admin@example.com",
        password="password",
        sadc=sadc,
        name="Admin User",
        is_org_admin=True
    )

@pytest.fixture
def regular_user(sadc_and_mltc):
    """
    Creates a non-admin regular user associated with the Sadc,
    with explicit permission to access the allowed MLTC.
    """
    sadc, mltc = sadc_and_mltc
    user = User.objects.create_user(
        email="user@example.com",
        password="password",
        sadc=sadc,
        name="Regular User",
        is_org_admin=False
    )
    user.allowed_mltcs.add(mltc)
    return user

@pytest.mark.django_db
def test_get_mltc_list_as_regular_user(api_client, regular_user, sadc_and_mltc):
    """
    Test that a regular user only sees MLTCs they are allowed to access.
    """
    sadc, mltc = sadc_and_mltc
    api_client.force_authenticate(user=regular_user)

    url = reverse("mltcs")
    resp = api_client.get(url)

    assert resp.status_code == 200
    data = resp.json()
    # Regular user should only get the allowed MLTC
    assert len(data) == 1
    assert data[0]["name"] == mltc.name

@pytest.mark.django_db
def test_get_mltc_list_as_admin(api_client, admin_user, sadc_and_mltc):
    """
    Test that admin user sees all MLTCs for their Sadc.
    """
    sadc, mltc = sadc_and_mltc
    api_client.force_authenticate(user=admin_user)

    url = reverse("mltcs")
    resp = api_client.get(url)

    assert resp.status_code == 200
    data = resp.json()
    # Admin sees all MLTCs
    assert len(data) == 1
    assert data[0]["name"] == mltc.name

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
def test_update_mltc_forbidden_for_regular_user(api_client, regular_user, sadc_and_mltc):
    """
    Verify regular user cannot update MLTC.
    """
    _, mltc = sadc_and_mltc
    api_client.force_authenticate(user=regular_user)

    url = reverse("mltc", args=[mltc.id])
    resp = api_client.put(url, {"name": "Updated"}, format="json")

    assert resp.status_code == 403

@pytest.mark.django_db
def test_update_mltc_success_for_admin(api_client, admin_user, sadc_and_mltc):
    """
    Verify admin user can update MLTC details successfully.
    """
    _, mltc = sadc_and_mltc
    api_client.force_authenticate(user=admin_user)

    url = reverse("mltc", args=[mltc.id])
    resp = api_client.put(url, {"name": "Updated", "dx_codes": ["DX1"]}, format="json")

    assert resp.status_code == 200
    assert resp.data["name"] == "Updated"

@pytest.mark.django_db
def test_delete_mltc_forbidden_for_regular_user(api_client, regular_user, sadc_and_mltc):
    """
    Verify regular user cannot delete an MLTC.
    """
    _, mltc = sadc_and_mltc
    api_client.force_authenticate(user=regular_user)

    url = reverse("mltc", args=[mltc.id])
    resp = api_client.delete(url)

    assert resp.status_code == 403

@pytest.mark.django_db
def test_delete_mltc_success_for_admin(api_client, admin_user, sadc_and_mltc):
    """
    Verify admin user can delete MLTC successfully.
    """
    _, mltc = sadc_and_mltc
    api_client.force_authenticate(user=admin_user)

    url = reverse("mltc", args=[mltc.id])
    resp = api_client.delete(url)

    assert resp.status_code == 204
    assert not Mltc.objects.filter(id=mltc.id).exists()
