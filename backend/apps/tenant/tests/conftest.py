import pytest
from backend.apps.tenant.models.sadc_model import Sadc
from backend.apps.tenant.models.mltc_model import Mltc

@pytest.fixture
def org_setup(db):
    """
    Fixture to set up test organization data:
    - Creates one Sadc instance.
    - Creates two MLTC instances associated with that Sadc:
        * mltc_allowed: Represents an MLTC that will be considered "allowed" in tests.
        * mltc_denied: Represents an MLTC that will be considered "denied" in tests.
    Returns a dictionary containing the created Sadc and MLTC objects for use in tests.
    """
    sadc = Sadc.objects.create(name="Test SADC")
    mltc_allowed = Mltc.objects.create(name="Allowed MLTC", sadc=sadc)
    mltc_denied = Mltc.objects.create(name="Denied MLTC", sadc=sadc)
    return {
        "sadc": sadc,
        "mltc_allowed": mltc_allowed,
        "mltc_denied": mltc_denied,
    }