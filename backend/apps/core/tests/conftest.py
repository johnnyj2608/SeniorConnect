import pytest
from django.utils import timezone
from backend.apps.core.models.member_model import Member
from backend.apps.core.models.authorization_model import Authorization
from backend.conftest import org_setup

@pytest.fixture
def members_setup(db, org_setup):
    """
    Fixture to set up Member instances for testing:
    - Uses org_setup fixture to get Sadc and MLTC instances.
    - Creates three members:
      1. Member with an allowed MLTC authorization (active_auth set).
      2. Member with a denied MLTC authorization (active_auth set).
      3. Member with no active authorization (no active_auth).
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

    return {
        "members": (m1, m2, m3),
        "sadc": sadc,
        "mltc_allowed": mltc_allowed,
        "mltc_denied": mltc_denied,
    }