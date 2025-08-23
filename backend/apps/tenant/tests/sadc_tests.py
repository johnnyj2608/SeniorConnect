import pytest
import json
from django.urls import reverse
from rest_framework import status
from backend.apps.tenant.models.sadc_model import Sadc

# ==============================
# SADC Detail Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,target_sadc,expected_status",
    [
        # Admin accessing own SADC → 200
        ("api_client_admin", "org", status.HTTP_200_OK),
        # Regular accessing own SADC → 200
        ("api_client_regular", "org", status.HTTP_200_OK),
    ]
)
def test_sadc_detail(
    request, 
    org_setup, 
    other_org_setup, 
    user_fixture, 
    target_sadc, 
    expected_status
):
    client = request.getfixturevalue(user_fixture)

    if target_sadc == "org":
        url = reverse("sadc")
    elif target_sadc == "other_org":
        other_sadc = other_org_setup["other_sadc"]
        url = reverse("sadc") + f"?id={other_sadc.id}"
    else:
        url = reverse("sadc") + "?id=999999"

    resp = client.get(url)
    assert resp.status_code == expected_status


# ==============================
# SADC Update Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,field_to_update,new_value,expected_status",
    [
        # Admin attempts to update name → 200, but name must not change
        ("api_client_admin", "name", "New SADC Name", status.HTTP_200_OK),
        # Admin updates languages → success
        ("api_client_admin", "languages", ["English", "Spanish"], status.HTTP_200_OK),
        # Admin updates attendance_template → success
        ("api_client_admin", "attendance_template", 2, status.HTTP_200_OK),
       
        # Regular user updates name → fail
        ("api_client_regular", "name", "Attempt Name Change", status.HTTP_403_FORBIDDEN),
        # Regular user updates languages → fail
        ("api_client_regular", "languages", ["French"], status.HTTP_403_FORBIDDEN),
        # Regular user updates attendance_template → fail
        ("api_client_regular", "attendance_template", 3, status.HTTP_403_FORBIDDEN),
    ]
)
def test_sadc_update(
    request, 
    org_setup, 
    user_fixture, 
    field_to_update, 
    new_value, 
    expected_status
):
    client = request.getfixturevalue(user_fixture)
    sadc_obj = org_setup["sadc"]
    url = reverse("sadc")

    # Prepare payload
    payload = {
        "name": sadc_obj.name,
        "languages": json.dumps(sadc_obj.languages), 
        "attendance_template": sadc_obj.attendance_template
    }

    if field_to_update == "name":
        payload["name"] = new_value
    elif field_to_update == "languages":
        payload["languages"] = json.dumps(new_value)
    elif field_to_update == "attendance_template":
        payload["attendance_template"] = new_value

    resp = client.put(url, data=payload, format="multipart")
    assert resp.status_code == expected_status

    sadc_obj.refresh_from_db()

    if field_to_update == "name":
        # Name is always read-only → never changes
        assert sadc_obj.name != new_value
    elif field_to_update == "languages":
        if expected_status == status.HTTP_200_OK:
            assert sadc_obj.languages == new_value
        else:
            assert sadc_obj.languages != new_value
    elif field_to_update == "attendance_template":
        if expected_status == status.HTTP_200_OK:
            assert sadc_obj.attendance_template == new_value
        else:
            assert sadc_obj.attendance_template != new_value