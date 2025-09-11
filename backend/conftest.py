import pytest
from rest_framework.test import APIClient
from backend.apps.tenant.models.sadc_model import Sadc
from backend.apps.tenant.models.mltc_model import Mltc
from backend.apps.core.models.member_model import Member
from backend.apps.core.models.authorization_model import Authorization
from django.contrib.auth import get_user_model
from django.utils import timezone
from unittest.mock import patch

User = get_user_model()

@pytest.fixture
def api_client_admin(admin_user):
    client = APIClient()
    client.force_authenticate(user=admin_user)
    return client

@pytest.fixture
def api_client_regular(regular_user):
    client = APIClient()
    client.force_authenticate(user=regular_user)
    return client

@pytest.fixture
def org_setup(db):
    """
    Fixture to set up test organization data:
    - Creates one Sadc instance with detailed fields.
    - Creates two MLTC instances associated with that Sadc:
        * mltc_allowed: Represents an MLTC that will be considered "allowed" in tests.
        * mltc_denied: Represents an MLTC that will be considered "denied" in tests.
    Returns a dictionary containing the created Sadc and MLTC objects for use in tests.
    """
    sadc = Sadc.objects.create(
        name="Test SADC",
        email="test@sadc.com",
        phone="1234567890",
        address="123 Main St, Test City, TS 12345",
        npi="1234567890",
        attendance_template=1,
        languages=["English", "Chinese"],
        active=True,
    )
    mltc_allowed = Mltc.objects.create(
        sadc=sadc,
        name="Allowed MLTC",
        dx_codes=["DX1", "DX2"],
        active=True,
    )
    mltc_denied = Mltc.objects.create(
        sadc=sadc,
        name="Denied MLTC",
        dx_codes=["DX3", "DX4"],
        active=True,
    )
    return {
        "sadc": sadc,
        "mltc_allowed": mltc_allowed,
        "mltc_denied": mltc_denied,
    }

@pytest.fixture
def other_org_setup(db):
    """
    Fixture to set up another organization with its own SADC and MLTCs.
    Useful for testing unauthorized access or cross-organization scenarios.
    """
    other_sadc = Sadc.objects.create(
        name="Other SADC",
        email="other@sadc.com",
        phone="0987654321",
        address="456 Other St, Other City, OC 67890",
        npi="0987654321",
        attendance_template=1,
        languages=["English"],
        active=True,
    )
    other_mltc_allowed = Mltc.objects.create(
        sadc=other_sadc,
        name="Other Allowed MLTC",
        dx_codes=["DX5", "DX6"],
        active=True,
    )
    other_mltc_denied = Mltc.objects.create(
        sadc=other_sadc,
        name="Other Denied MLTC",
        dx_codes=["DX7", "DX8"],
        active=True,
    )
    other_member = Member.objects.create(
        sadc=other_sadc,
        sadc_member_id=99,
        first_name="Other",
        last_name="Member",
        birth_date="1990-01-01",
    )
    return {
        "other_sadc": other_sadc,
        "other_mltc_allowed": other_mltc_allowed,
        "other_mltc_denied": other_mltc_denied,
        "other_member": other_member,
    }


@pytest.fixture
def members_setup(db, org_setup):
    """
    Fixture to set up Member instances for testing:
    - Uses org_setup fixture to get Sadc and MLTC instances.
    - Creates three members:
      1. Member with an allowed MLTC authorization (active_auth set).
      2. Member with a denied MLTC authorization (active_auth set).
      3. Member with no active authorization (no active_auth).
      4. Member with inactive status (no active_auth).
    Returns a dictionary containing:
    - 'members': tuple of the three created Member instances.
    - 'sadc': the Sadc instance from org_setup.
    - 'mltc_allowed': the MLTC considered allowed.
    - 'mltc_denied': the MLTC considered denied.
    """
    sadc = org_setup["sadc"]
    mltc_allowed = org_setup["mltc_allowed"]
    mltc_denied = org_setup["mltc_denied"]

    # Member with allowed MLTC authorization
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

    # Member with denied MLTC authorization
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

    # Member without any active authorization
    m3 = Member.objects.create(
        sadc=sadc,
        sadc_member_id=3,
        first_name="NoAuth",
        last_name="Member",
        birth_date="1990-01-01",
        gender="M",
    )

    # Member inactive
    m4 = Member.objects.create(
        sadc=sadc,
        sadc_member_id=4,
        first_name="Inactive",
        last_name="Member",
        birth_date="1990-01-01",
        gender="F",
        active=False,
    )

    return {
        "members": (m1, m2, m3, m4),
        "sadc": sadc,
        "mltc_allowed": mltc_allowed,
        "mltc_denied": mltc_denied,
    }

@pytest.fixture
def admin_user(org_setup):
    sadc = org_setup['sadc']
    return User.objects.create_user(
        email="admin@example.com",
        password="password",
        sadc=sadc,
        name="Admin User",
        is_org_admin=True
    )

@pytest.fixture
def regular_user(org_setup):
    sadc = org_setup['sadc']
    mltc_allowed = org_setup['mltc_allowed']
    user = User.objects.create_user(
        email="user@example.com",
        password="password",
        sadc=sadc,
        name="Regular User",
        is_org_admin=False
    )
    user.allowed_mltcs.add(mltc_allowed)
    return user

@pytest.fixture(autouse=True)
def mock_supabase(monkeypatch):
    # Mock Supabase client creation
    patcher_client = patch(
        "backend.apps.common.utils.supabase.create_client",
        return_value=object()  # <-- simple dummy object
    )
    patcher_signed_url = patch(
        "backend.apps.common.utils.supabase.get_signed_url",
        return_value="https://supabase.test/file.pdf"
    )
    patcher_client.start()
    patcher_signed_url.start()
    yield
    patcher_client.stop()
    patcher_signed_url.stop()