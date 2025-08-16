import pytest
from django.urls import reverse

# ==============================
# SADC Detail Tests
# ==============================

@pytest.mark.django_db
def test_get_sadc_detail_as_user(api_client_regular, org_setup):
    """Regular user can GET SADC details."""
    sadc = org_setup['sadc']
    url = reverse("sadc")

    response = api_client_regular.get(url)
    assert response.status_code == 200
    assert response.data["name"] == sadc.name
    assert response.data["email"] == sadc.email
    assert response.data.get("languages") == sadc.languages

@pytest.mark.django_db
def test_get_sadc_detail_as_admin(api_client_admin, org_setup):
    """Admin user can GET SADC details."""
    sadc = org_setup['sadc']
    url = reverse("sadc")

    response = api_client_admin.get(url)
    assert response.status_code == 200
    assert response.data["name"] == sadc.name
    assert response.data["email"] == sadc.email
    assert response.data.get("languages") == sadc.languages


# ==============================
# SADC Update Tests
# ==============================

@pytest.mark.django_db
def test_update_sadc_success_for_admin(api_client_admin, org_setup):
    """Admin user can successfully update allowed SADC fields."""
    sadc = org_setup['sadc']
    url = reverse("sadc")

    new_data = {
        "attendance_template": 2,
        "languages": ["English", "Chinese"]
    }
    response = api_client_admin.put(url, new_data, format="json")
    assert response.status_code == 200
    assert response.data["attendance_template"] == new_data["attendance_template"]
    assert response.data["languages"] == new_data["languages"]

    sadc.refresh_from_db()
    assert sadc.attendance_template == new_data["attendance_template"]
    assert sadc.languages == new_data["languages"]

@pytest.mark.django_db
def test_update_sadc_forbidden_for_non_admin(api_client_regular, org_setup):
    """Non-admin user cannot update SADC; should return 403."""
    url = reverse("sadc")

    new_data = {
        "attendance_template": 2,
        "languages": ["English", "Spanish"]
    }
    response = api_client_regular.put(url, new_data, format="json")
    assert response.status_code == 403
    assert response.data["detail"] == "Admin access required."

@pytest.mark.django_db
def test_update_sadc_invalid_data_for_admin(api_client_admin, org_setup):
    """Admin cannot update SADC with invalid data; should return 400."""
    url = reverse("sadc")

    invalid_data = {
        "attendance_template": "invalid",
        "languages": "English"
    }
    response = api_client_admin.put(url, invalid_data, format="json")
    assert response.status_code == 400
    assert "attendance_template" in response.data or "languages" in response.data
