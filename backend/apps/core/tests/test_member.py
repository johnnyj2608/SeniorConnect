import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from django.utils import timezone
from django.contrib.auth import get_user_model

from backend.apps.core.models.member_model import Member
from backend.apps.core.models.authorization_model import Authorization
from backend.apps.tenant.models.sadc_model import Sadc
from backend.apps.tenant.models.mltc_model import Mltc

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def org_setup(db):
    """
    Creates:
      - 1 Sadc
      - 2 Mltcs (allowed / denied)
      - 3 members:
          * member1 -> active_auth -> allowed MLTC
          * member2 -> active_auth -> denied MLTC
          * member3 -> no active_auth (should be included)
    """
    sadc = Sadc.objects.create(name="Test SADC")
    mltc_allowed = Mltc.objects.create(name="Allowed MLTC", sadc=sadc)
    mltc_denied = Mltc.objects.create(name="Denied MLTC", sadc=sadc)

    # Member with allowed MLTC
    m1 = Member.objects.create(
        sadc=sadc,
        sadc_member_id=1,
        first_name="Allowed",
        last_name="Member",
        birth_date="1990-01-01",
        gender="M",
    )
    a1 = Authorization.objects.create(
        member=m1,
        mltc=mltc_allowed,
        mltc_member_id="001",
        start_date=timezone.now().date(),
        end_date=timezone.now().date(),
        active=True,
        schedule=[],
    )
    m1.active_auth = a1
    m1.save()

    # Member with denied MLTC
    m2 = Member.objects.create(
        sadc=sadc,
        sadc_member_id=2,
        first_name="Denied",
        last_name="Member",
        birth_date="1990-01-01",
        gender="M",
    )
    a2 = Authorization.objects.create(
        member=m2,
        mltc=mltc_denied,
        mltc_member_id="002",
        start_date=timezone.now().date(),
        end_date=timezone.now().date(),
        active=True,
        schedule=[],
    )
    m2.active_auth = a2
    m2.save()

    # Member with no active_auth (should be included)
    m3 = Member.objects.create(
        sadc=sadc,
        sadc_member_id=3,
        first_name="NoAuth",
        last_name="Member",
        birth_date="1990-01-01",
        gender="M",
    )

    return {
        "sadc": sadc,
        "mltc_allowed": mltc_allowed,
        "mltc_denied": mltc_denied,
        "members": (m1, m2, m3),
    }

@pytest.mark.django_db
def test_regular_user_sees_allowed_and_null_mltc(api_client, org_setup):
    sadc = org_setup["sadc"]
    mltc_allowed = org_setup["mltc_allowed"]

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
    returned_ids = {m["sadc_member_id"] for group in data.values() for m in group}

    assert returned_ids == {1, 3}

    assert "Allowed MLTC" in data
    assert "unknown" in data

@pytest.mark.django_db
def test_org_admin_sees_all_sadc_members(api_client, org_setup):
    sadc = org_setup["sadc"]

    user = User.objects.create_user(
        email="orgadmin@example.com",
        password="pw",
        sadc=sadc,
        name="Org Admin",
        is_org_admin=True
    )
    user.is_org_admin = True
    user.save()

    client = api_client
    client.force_authenticate(user=user)

    resp = client.get(reverse("members"))
    assert resp.status_code == 200

    data = resp.json()
    returned_ids = {m["sadc_member_id"] for group in data.values() for m in group}
    assert returned_ids == {1, 2, 3}