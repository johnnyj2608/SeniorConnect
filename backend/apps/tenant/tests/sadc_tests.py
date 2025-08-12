import pytest
from django.urls import reverse

@pytest.mark.django_db
def test_get_sadc_detail_as_user(api_client, org_setup, regular_user):
    """
    Test that any authenticated user (admin or non-admin) can retrieve
    their associated Sadc details via GET request.
    """
    sadc = org_setup['sadc']
    api_client.force_authenticate(user=regular_user)
    url = reverse("sadc")

    response = api_client.get(url)
    assert response.status_code == 200
    assert response.data["name"] == sadc.name
    assert response.data["email"] == sadc.email
    assert response.data.get("languages") == sadc.languages

@pytest.mark.django_db
def test_update_sadc_forbidden_for_non_admin(api_client, org_setup, regular_user):
    """
    Test that a non-admin user cannot update the Sadc data.
    Should return 403 Forbidden with appropriate error message.
    """
    api_client.force_authenticate(user=regular_user)
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
def test_update_sadc_success_for_admin(api_client, org_setup, admin_user):
    """
    Test that an admin user can successfully update allowed fields on Sadc
    (attendance_template and languages) via PUT request.
    """
    sadc = org_setup['sadc']
    api_client.force_authenticate(user=admin_user)
    url = reverse("sadc")

    new_data = {
        "attendance_template": 2,
        "languages": ["English", "Chinese"]
    }
    response = api_client.put(url, new_data, format="json")
    assert response.status_code == 200
    assert response.data["attendance_template"] == new_data["attendance_template"]
    assert response.data["languages"] == new_data["languages"]

    sadc.refresh_from_db()
    assert sadc.attendance_template == new_data["attendance_template"]
    assert sadc.languages == new_data["languages"]