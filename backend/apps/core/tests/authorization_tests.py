import io
import pytest
from django.urls import reverse
from rest_framework import status
from backend.apps.core.models.authorization_model import Authorization, AuthorizationService
from datetime import date
from unittest.mock import patch
import json

# ==============================
# Authorization Listing Tests
# ==============================

@pytest.mark.django_db
def test_get_authorization_list(api_client_regular, members_setup):
    member = members_setup["members"][0]
    mltc = members_setup["mltc_allowed"]

    Authorization.objects.create(
        mltc=mltc,
        member=member,
        mltc_member_id="M123",
        start_date=date(2025, 1, 1),
        end_date=date(2025, 12, 31),
        schedule=[],
    )

    url = reverse("auths")
    response = api_client_regular.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) >= 1

# ==============================
# Authorization Detail Tests
# ==============================

@pytest.mark.django_db
def test_get_authorization_detail(api_client_regular, members_setup):
    member = members_setup["members"][0]
    mltc = members_setup["mltc_allowed"]

    auth = Authorization.objects.create(
        mltc=mltc,
        member=member,
        mltc_member_id="M124",
        start_date=date(2025, 1, 1),
        end_date=date(2025, 6, 30),
        schedule=[],
    )

    url = reverse("auth", args=[auth.id])
    response = api_client_regular.get(url)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["mltc"] == mltc.name
    assert data["mltc_member_id"] == "M124"

@pytest.mark.django_db
def test_get_authorization_other_org(api_client_regular, other_org_setup):
    other_member = other_org_setup["other_member"]

    url = reverse("auth_by_member", args=[other_member.id])
    response = api_client_regular.get(url)

    assert response.status_code == status.HTTP_403_FORBIDDEN

# ==============================
# Authorization Create Tests
# ==============================

@pytest.mark.django_db
def test_create_authorization(api_client_regular, members_setup):
    member = members_setup["members"][0]
    mltc = members_setup["mltc_allowed"]

    url = reverse("auths")
    payload = {
        "mltc": mltc.name,
        "member": member.id,
        "mltc_member_id": "M125",
        "start_date": "2025-01-01",
        "end_date": "2025-06-30",
        "schedule": "[]",
        "services": '[{"service_type": "sdc", "auth_id": "S1"}]',
    }

    response = api_client_regular.post(url, data=payload)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["mltc"] == mltc.name
    assert data["mltc_member_id"] == "M125"
    assert any(s["service_type"] == "sdc" for s in data["services"])

@pytest.mark.django_db
@patch("backend.apps.core.utils.authorization_utils.upload_file_to_supabase")
def test_create_authorization_with_file(mock_upload_file, api_client_regular, members_setup):
    member = members_setup["members"][0]
    mltc = members_setup["mltc_allowed"]

    mock_upload_file.return_value = ("supabase/path/fakefile.pdf", None)

    url = reverse("auths")
    file_content = io.BytesIO(b"dummy data")
    file_content.name = "dummyfile.pdf"

    payload = {
        "mltc": mltc.name,
        "member": member.id,
        "mltc_member_id": "M130",
        "start_date": "2025-01-01",
        "end_date": "2025-06-30",
        "schedule": "[]",
        "services": "[]",
        "file": file_content,
    }

    response = api_client_regular.post(url, data=payload, format="multipart")
    assert response.status_code == status.HTTP_201_CREATED

    auth = Authorization.objects.get(id=response.data["id"])
    assert auth.file == "supabase/path/fakefile.pdf"

# ==============================
# Authorization Update Tests
# ==============================

@pytest.mark.django_db
def test_update_authorization(api_client_regular, members_setup):
    member = members_setup["members"][0]
    mltc = members_setup["mltc_allowed"]

    auth = Authorization.objects.create(
        mltc=mltc,
        member=member,
        mltc_member_id="M126",
        start_date=date(2025, 1, 1),
        end_date=date(2025, 6, 30),
        schedule=[],
    )
    AuthorizationService.objects.create(
        authorization=auth,
        service_type=AuthorizationService.SDC,
        auth_id="S2"
    )

    url = reverse("auth", args=[auth.id])
    payload = {
        "mltc": mltc.name,
        "member": member.id,
        "mltc_member_id": "M126-UPDATED",
        "start_date": "2025-02-01",
        "end_date": "2025-08-31",
        "schedule": "[]",
        "services": f'[{{"id": "{auth.services.first().id}", "service_type": "sdc", "auth_id": "S2-UPDATED"}}]',
    }

    response = api_client_regular.put(url, data=payload)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["mltc_member_id"] == "M126-UPDATED"
    assert any(s["auth_id"] == "S2-UPDATED" for s in data["services"])

@pytest.mark.django_db
def test_update_authorization_denied_mltc(api_client_regular, members_setup):
    member = members_setup["members"][0]
    denied_mltc = members_setup["mltc_denied"]
    allowed_mltc = members_setup["mltc_allowed"]

    auth = Authorization.objects.create(
        member=member,
        mltc=allowed_mltc,
        mltc_member_id="ALLOWED1",
        start_date=date(2025, 1, 1),
        end_date=date(2025, 6, 30),
        schedule=[]
    )

    url = reverse("auth", args=[auth.id])
    payload = {
        "mltc": denied_mltc.name,
        "member": str(member.id),
        "mltc_member_id": "DENIED1",
        "start_date": "2025-01-01",
        "end_date": "2025-06-30",
        "schedule": json.dumps([])
    }

    response = api_client_regular.put(url, data=payload, format="multipart")
    assert response.status_code == status.HTTP_403_FORBIDDEN

# ==============================
# Authorization Delete Tests
# ==============================

@pytest.mark.django_db
def test_delete_authorization(api_client_regular, members_setup):
    member = members_setup["members"][0]
    mltc = members_setup["mltc_allowed"]

    auth = Authorization.objects.create(
        mltc=mltc,
        member=member,
        mltc_member_id="M127",
        start_date=date(2025, 1, 1),
        end_date=date(2025, 6, 30),
        schedule=[],
    )

    url = reverse("auth_delete", args=[auth.id, member.id])
    response = api_client_regular.delete(url)
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert Authorization.objects.filter(id=auth.id).count() == 0

@pytest.mark.django_db
@patch("backend.apps.core.utils.authorization_utils.delete_file_from_supabase")
def test_delete_authorization_with_file(mock_delete_file, api_client_regular, members_setup):
    member = members_setup["members"][0]
    mltc = members_setup["mltc_allowed"]

    auth = Authorization.objects.create(
        mltc=mltc,
        member=member,
        mltc_member_id="M129",
        start_date=date(2025, 1, 1),
        end_date=date(2025, 6, 30),
        schedule=[],
        file="path/to/fakefile.pdf"
    )

    url = reverse("auth_delete", args=[auth.id, member.id])
    response = api_client_regular.delete(url)

    assert response.status_code == status.HTTP_204_NO_CONTENT
    mock_delete_file.assert_called_once_with("path/to/fakefile.pdf")
    assert Authorization.objects.filter(id=auth.id).count() == 0

@pytest.mark.django_db
def test_delete_authorization_other_org(api_client_regular, other_org_setup):
    other_member = other_org_setup["other_member"]
    other_mltc = other_org_setup["other_mltc_allowed"]

    auth = Authorization.objects.create(
        mltc=other_mltc,
        member=other_member,
        mltc_member_id="O1",
        start_date=date(2025, 1, 1),
        end_date=date(2025, 6, 30),
        schedule=[]
    )

    url = reverse("auth_delete", args=[auth.id, other_member.id])
    response = api_client_regular.delete(url)

    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert Authorization.objects.filter(id=auth.id).exists()


# ==============================
# Authorization By Member Tests
# ==============================

@pytest.mark.django_db
def test_get_authorizations_by_member(api_client_regular, members_setup):
    member = members_setup["members"][0]
    mltc = members_setup["mltc_allowed"]

    Authorization.objects.create(
        mltc=mltc,
        member=member,
        mltc_member_id="M128",
        start_date=date(2025, 1, 1),
        end_date=date(2025, 12, 31),
        schedule=[],
    )

    url = reverse("auth_by_member", args=[member.id])
    response = api_client_regular.get(url)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) >= 1
    assert any(auth["mltc_member_id"] == "M128" for auth in data)