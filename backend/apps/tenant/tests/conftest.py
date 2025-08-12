import pytest
from rest_framework.test import APIClient
from backend.apps.tenant.models.sadc_model import Sadc
from backend.apps.tenant.models.mltc_model import Mltc
from django.contrib.auth import get_user_model

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

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
