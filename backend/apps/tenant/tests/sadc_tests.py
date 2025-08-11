import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from backend.apps.tenant.models.sadc_model import Sadc
from django.contrib.auth import get_user_model

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def sadc_and_user(db):
    # Create a Sadc instance and a normal (non-admin) user linked to it
    sadc = Sadc.objects.create(
        name="Test SADC",
        email="test@sadc.com",
        phone="1234567890",
        address="123 Main St",
        npi="1234567890",
        attendance_template=1,
        languages=["English"],
    )
    user = User.objects.create_user(
        email="user@example.com",
        password="password",
        sadc=sadc,
        name="Test User",
        is_org_admin=False
    )
    return sadc, user

@pytest.fixture
def sadc_and_admin_user(db):
    # Create a Sadc instance and an admin user linked to it
    sadc = Sadc.objects.create(
        name="Test SADC",
        email="test@sadc.com",
        phone="1234567890",
        address="123 Main St",
        npi="1234567890",
        attendance_template=1,
        languages=["English"],
    )
    admin_user = User.objects.create_user(
        email="admin@example.com",
        password="password",
        sadc=sadc,
        name="Admin User",
        is_org_admin=True
    )
    return sadc, admin_user

@pytest.mark.django_db
def test_get_sadc_detail_as_user(api_client, sadc_and_user):
    """
    Test that any authenticated user (admin or non-admin) can retrieve
    their associated Sadc details via GET request.
    """
    sadc, user = sadc_and_user
    api_client.force_authenticate(user=user)
    url = reverse("sadc")

    response = api_client.get(url)
    assert response.status_code == 200
    assert response.data["name"] == sadc.name
    assert response.data["email"] == sadc.email
    assert response.data["languages"] == ["English"]

@pytest.mark.django_db
def test_update_sadc_forbidden_for_non_admin(api_client, sadc_and_user):
    """
    Test that a non-admin user cannot update the Sadc data.
    Should return 403 Forbidden with appropriate error message.
    """
    sadc, user = sadc_and_user
    api_client.force_authenticate(user=user)
    url = reverse("sadc")

    new_data = {
        "attendance_template": 2,
        "languages": ["English", "Spanish"]
    }
    response = api_client.put(url, new_data, format="json")
    assert response.status_code == 403
    assert "detail" in response.data
    assert response.data["detail"] == "Admin access required."

@pytest.mark.django_db
def test_update_sadc_success_for_admin(api_client, sadc_and_admin_user):
    """
    Test that an admin user can successfully update allowed fields on Sadc
    (attendance_template and languages) via PUT request.
    """
    sadc, admin_user = sadc_and_admin_user
    api_client.force_authenticate(user=admin_user)
    url = reverse("sadc")

    new_data = {
        "attendance_template": 2,
        "languages": ["English", "Spanish"]
    }
    response = api_client.put(url, new_data, format="json")
    assert response.status_code == 200
    assert response.data["attendance_template"] == new_data["attendance_template"]
    assert response.data["languages"] == new_data["languages"]

    sadc.refresh_from_db()
    assert sadc.attendance_template == new_data["attendance_template"]
    assert sadc.languages == new_data["languages"]