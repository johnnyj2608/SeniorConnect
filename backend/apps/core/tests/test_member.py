import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.mark.django_db
def test_regular_user_sees_allowed_and_null_mltc(api_client, members_setup):
    """
    Test that a regular user only sees members associated with MLTCs
    they are allowed to access plus members with no active authorization (null MLTC).
    """
    sadc = members_setup["sadc"]
    mltc_allowed = members_setup["mltc_allowed"]

    # Create a regular user and assign allowed MLTC
    user = User.objects.create_user(
        email="regular@example.com",
        password="pw",
        sadc=sadc,
        name="Regular User"
    )
    user.allowed_mltcs.add(mltc_allowed)
    user.save()

    client = api_client
    client.force_authenticate(user=user)

    url = reverse("members")
    resp = client.get(url)
    assert resp.status_code == 200

    data = resp.json()
    # Collect all sadc_member_ids returned in all groups
    returned_ids = {m["sadc_member_id"] for group in data.values() for m in group}

    # Regular user should only see member with allowed MLTC (id=1) and member with no auth (id=3)
    assert returned_ids == {1, 3}

    # Response should contain keys for allowed MLTC and unknown (null) MLTC
    assert "Allowed MLTC" in data
    assert "unknown" in data

@pytest.mark.django_db
def test_org_admin_sees_all_sadc_members(api_client, members_setup):
    """
    Test that an organization admin user sees all members under the SADC,
    regardless of MLTC authorization.
    """
    sadc = members_setup["sadc"]

    # Create an org admin user
    user = User.objects.create_user(
        email="orgadmin@example.com",
        password="pw",
        sadc=sadc,
        name="Org Admin",
        is_org_admin=True
    )
    user.save()

    client = api_client
    client.force_authenticate(user=user)

    resp = client.get(reverse("members"))
    assert resp.status_code == 200

    data = resp.json()
    returned_ids = {m["sadc_member_id"] for group in data.values() for m in group}

    # Org admin should see all members: with allowed, denied, and no active auth (ids 1, 2, 3)
    assert returned_ids == {1, 2, 3}