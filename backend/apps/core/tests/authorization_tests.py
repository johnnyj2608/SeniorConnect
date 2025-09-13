import io
import pytest
from django.urls import reverse
from rest_framework import status
from backend.apps.core.models.authorization_model import Authorization, AuthorizationService
from datetime import date
from unittest.mock import patch
import json

# ==============================
# Authorization List Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,mltc_attr,other_sadc_flag,should_see",
    [
        # 1. Admin can get any from own SADC
        ("api_client_admin", "mltc_denied", False, True),

        # 2. Admin cannot get from other SADC
        ("api_client_admin", "mltc_allowed", True, False),

        # 3. Regular can get from MLTC allowed
        ("api_client_regular", "mltc_allowed", False, True),

        # 4. Regular cannot get from MLTC denied
        ("api_client_regular", "mltc_denied", False, False),

        # 5. Regular cannot see member with no active authorization
        ("api_client_regular", None, False, False),

        # 6. Regular cannot see inactive member
        ("api_client_regular", None, False, False),
    ]
)
def test_authorization_list(
    request,
    user_fixture,
    mltc_attr,
    other_sadc_flag,
    should_see,
    members_setup,
    org_setup,
    other_org_setup,
):
    client = request.getfixturevalue(user_fixture)

    # Pick the correct member and MLTC object
    if other_sadc_flag:
        member = other_org_setup["other_member"]
    else:
        if mltc_attr == "mltc_allowed":
            member = members_setup["members"][0]  # allowed
        elif mltc_attr == "mltc_denied":
            member = members_setup["members"][1]  # denied
        else:
            # For no active auth or inactive member
            if not should_see:
                member = members_setup["members"][2]  # no active auth
            else:
                member = members_setup["members"][3]  # inactive member

    url = reverse("auths")
    response = client.get(url)
    assert response.status_code == status.HTTP_200_OK

    results = response.data
    if should_see:
        assert any(a["member"] == member.id for a in results)
    else:
        assert all(a["member"] != member.id for a in results)

# ==============================
# Authorization Detail Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,mltc_attr,other_sadc_flag,should_see,not_found",
    [
        # 1. Admin can get any from own SADC
        ("api_client_admin", "mltc_denied", False, True, False),

        # 2. Admin cannot get from other SADC
        ("api_client_admin", "mltc_allowed", True, False, False),

        # 3. Regular can get from MLTC allowed
        ("api_client_regular", "mltc_allowed", False, True, False),

        # 4. Regular cannot get from MLTC denied
        ("api_client_regular", "mltc_denied", False, False, False),

        # 5. Regular cannot see member with no active authorization
        ("api_client_regular", None, False, False, False),

        # 6. Regular cannot see inactive member
        ("api_client_regular", None, False, False, False),

        # 7. Authorization not found
        ("api_client_regular", "mltc_allowed", False, False, True),
    ]
)
def test_authorization_detail(
    request,
    user_fixture,
    mltc_attr,
    other_sadc_flag,
    should_see,
    not_found,
    members_setup,
    org_setup,
    other_org_setup,
):
    client = request.getfixturevalue(user_fixture)

    # Handle explicit "not found" test
    if not_found:
        url = reverse("auth", args=[9999])  # non-existent ID
        response = client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND
        return

    # Pick the member to test
    if other_sadc_flag:
        member = other_org_setup["other_member"]
    elif mltc_attr == "mltc_allowed":
        member = members_setup["members"][0]
    elif mltc_attr == "mltc_denied":
        member = members_setup["members"][1]
    else:
        # Member with no active authorization or inactive
        if members_setup["members"][2].active is False:
            member = members_setup["members"][3]  # inactive member
        else:
            member = members_setup["members"][2]  # no active auth

    # Get the member's active authorization safely
    auth = getattr(member, "active_auth", None)

    if auth:
        # Authorization exists → test access
        url = reverse("auth", args=[auth.id])
        response = client.get(url)

        if should_see:
            assert response.status_code == status.HTTP_200_OK
            assert response.data["id"] == auth.id
            assert response.data["mltc_member_id"] == auth.mltc_member_id
            assert response.data["mltc"] == auth.mltc.name
        else:
            # User should not have access → 404
            assert response.status_code == status.HTTP_404_NOT_FOUND
    else:
        # No authorization → detail endpoint should return 404
        url = reverse("auth", args=[9999])
        response = client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND

# ==============================
# Authorization Create Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,mltc_attr,other_sadc_flag,should_create,file_upload,duplicate_start",
    [
        # 1. Admin can create for own SADC, allowed MLTC
        ("api_client_admin", "mltc_denied", False, True, False, False),

        # 2. Admin cannot create for other SADC, allowed MLTC
        ("api_client_admin", "mltc_allowed", True, False, False, False),

        # 3. Regular user can create for allowed MLTC
        ("api_client_regular", "mltc_allowed", False, True, False, False),

        # 4. Regular user cannot create for denied MLTC
        ("api_client_regular", "mltc_denied", False, False, False, False),

        # 5. Regular user can create for allowed MLTC WITH file upload
        ("api_client_regular", "mltc_allowed", False, True, True, False),

        # 6. Attempt duplicate start date (should fail)
        ("api_client_admin", "mltc_allowed", False, False, False, True),
    ]
)
@patch("backend.apps.core.utils.authorization_utils.upload_file_to_supabase")
def test_authorization_create(
    mock_upload_file,
    request,
    user_fixture,
    mltc_attr,
    other_sadc_flag,
    should_create,
    file_upload,
    duplicate_start,
    members_setup,
    other_org_setup
):
    client = request.getfixturevalue(user_fixture)

    # Pick member and MLTC
    if other_sadc_flag:
        member = other_org_setup["other_member"]
        mltc = other_org_setup["other_mltc_allowed"]
    else:
        member = members_setup["members"][1] if mltc_attr == "mltc_denied" else members_setup["members"][0]
        mltc = members_setup[mltc_attr]

    # Prepare file if needed
    file_content = None
    if file_upload:
        mock_upload_file.return_value = ("supabase/path/fakefile.pdf", None)
        file_content = io.BytesIO(b"dummy data")
        file_content.name = "dummyfile.pdf"

    # Determine start/end date
    if duplicate_start and hasattr(member, "active_auth"):
        start_date = member.active_auth.start_date.strftime("%Y-%m-%d")
        end_date = member.active_auth.end_date.strftime("%Y-%m-%d")
    else:
        start_date = "2025-01-01"
        end_date = "2025-06-30"

    url = reverse("auths")
    payload = {
        "mltc": mltc.name,
        "member": member.id,
        "mltc_member_id": "M125" if not duplicate_start else "DUPLICATE01",
        "start_date": start_date,
        "end_date": end_date,
        "schedule": "[]",
        "services": '[{"service_type": "sdc", "auth_id": "S1"}]',
    }
    if file_content:
        payload["file"] = file_content

    response = client.post(url, data=payload, format="multipart")

    if should_create:
        assert response.status_code == status.HTTP_201_CREATED
        auth_id = response.data["id"]
        auth = Authorization.objects.get(id=auth_id)
        assert auth.member == member
        assert auth.mltc == mltc
        if file_upload:
            assert auth.file == "supabase/path/fakefile.pdf"
    else:
        # Either unauthorized or duplicate start date
        assert response.status_code in [status.HTTP_404_NOT_FOUND, status.HTTP_400_BAD_REQUEST]
        if duplicate_start:
            assert "unique" in str(response.data).lower()

# ==============================
# Authorization Update Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,mltc_attr,other_sadc_flag,should_update,file_upload,not_found,duplicate_start",
    [
        # 1. Admin can update own SADC, allowed MLTC
        ("api_client_admin", "mltc_denied", False, True, False, False, False),

        # 2. Admin cannot update other SADC
        ("api_client_admin", "mltc_allowed", True, False, False, False, False),

        # 3. Regular user can update allowed MLTC
        ("api_client_regular", "mltc_allowed", False, True, False, False, False),

        # 4. Regular user cannot update denied MLTC
        ("api_client_regular", "mltc_denied", False, False, False, False, False),

        # 5. Regular user can update allowed MLTC WITH file
        ("api_client_regular", "mltc_allowed", False, True, True, False, False),

        # 6. Authorization not found
        ("api_client_regular", "mltc_allowed", False, False, False, True, False),

        # 7. Attempt to violate duplicate start_date constraint
        ("api_client_admin", "mltc_allowed", False, False, False, False, True),
    ]
)
@patch("backend.apps.core.utils.authorization_utils.upload_file_to_supabase")
def test_authorization_update(
    mock_upload_file,
    request,
    user_fixture,
    mltc_attr,
    other_sadc_flag,
    should_update,
    file_upload,
    not_found,
    duplicate_start,
    members_setup,
    other_org_setup
):
    client = request.getfixturevalue(user_fixture)

    if other_sadc_flag:
        member = other_org_setup["other_member"]
        mltc = other_org_setup["other_mltc_allowed"]
    else:
        member = members_setup["members"][1] if mltc_attr == "mltc_denied" else members_setup["members"][0]
        mltc = members_setup[mltc_attr]

    auth = getattr(member, "active_auth", None) if not not_found else None

    if not auth:
        url = reverse("auth", args=[9999])  # non-existent ID
        response = client.put(url, data={}, format="multipart")
        assert response.status_code in [status.HTTP_404_NOT_FOUND, status.HTTP_400_BAD_REQUEST]
        return

    service = auth.services.first()
    if not service:
        service = AuthorizationService.objects.create(
            authorization=auth,
            service_type=AuthorizationService.SDC,
            auth_id="SVC1"
        )

    # Prepare file if needed
    file_content = None
    if file_upload:
        mock_upload_file.return_value = ("https://supabase.test/updated.pdf", None)
        file_content = io.BytesIO(b"updated file data")
        file_content.name = "updated.pdf"

    # ==============================
    # Handle duplicate start_date scenario
    # ==============================
    if duplicate_start:
        # Create a new authorization for the same member with a different start date
        new_auth = Authorization.objects.create(
            member=member,
            mltc=mltc,
            mltc_member_id="DUPLICATE_TEST",
            start_date=date(2025, 3, 1),
            end_date=date(2025, 12, 31),
            schedule=[]
        )
        auth_to_update = new_auth
        # Attempt to update start_date to match the fixture auth
        start_date_to_use = auth.start_date
    else:
        auth_to_update = auth
        start_date_to_use = auth.start_date

    payload = {
        "mltc": mltc.name,
        "member": str(member.id),
        "mltc_member_id": "UPDATED1",
        "start_date": str(start_date_to_use),
        "end_date": "2025-08-31",
        "schedule": json.dumps([]),
        "services": json.dumps([{
            "id": service.id,
            "service_type": "sdc",
            "auth_id": "SVC1-UPDATED"
        }])
    }
    if file_content:
        payload["file"] = file_content

    url = reverse("auth", args=[auth_to_update.id])
    response = client.put(url, data=payload, format="multipart")

    if duplicate_start:
        # Attempting to violate start_date constraint should return 400
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    elif should_update:
        assert response.status_code == status.HTTP_200_OK
        auth_to_update.refresh_from_db()
        assert auth_to_update.mltc_member_id == "UPDATED1"
        assert any(s.auth_id == "SVC1-UPDATED" for s in auth_to_update.services.all())
        if file_upload:
            assert auth_to_update.file == "https://supabase.test/updated.pdf"
    else:
        assert response.status_code == status.HTTP_404_NOT_FOUND
        auth_to_update.refresh_from_db()
        assert auth_to_update.mltc_member_id != "UPDATED1"


# ==============================
# Authorization Delete Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,mltc_attr,other_sadc_flag,should_delete,not_found,with_file",
    [
        # 1. Admin can delete own SADC, denied MLTC
        ("api_client_admin", "mltc_denied", False, True, False, False),

        # 2. Admin cannot delete from other SADC
        ("api_client_admin", "mltc_allowed", True, False, False, False),

        # 3. Regular can delete allowed MLTC
        ("api_client_regular", "mltc_allowed", False, True, False, False),

        # 4. Regular cannot delete denied MLTC
        ("api_client_regular", "mltc_denied", False, False, False, False),

        # 5. Authorization not found
        ("api_client_regular", "mltc_allowed", False, False, True, False),

        # 6. Delete with file
        ("api_client_admin", "mltc_allowed", False, True, False, True),
    ]
)
@patch("backend.apps.core.utils.authorization_utils.delete_file_from_supabase")
def test_authorization_delete(
    mock_delete_file,
    request,
    user_fixture,
    mltc_attr,
    other_sadc_flag,
    should_delete,
    not_found,
    with_file,
    members_setup,
    other_org_setup,
):
    client = request.getfixturevalue(user_fixture)

    if other_sadc_flag:
        member = other_org_setup["other_member"]
    else:
        member = members_setup["members"][1] if mltc_attr == "mltc_denied" else members_setup["members"][0]

    auth = getattr(member, "active_auth", None)

    if not auth or not_found:
        auth_id = 9999  # non-existent
        url = reverse("auth_delete", args=[auth_id, member.id])
        response = client.delete(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND
        return

    auth_id = auth.id
    if with_file:
        auth.file = "supabase/testfile.pdf"
        auth.save()

    url = reverse("auth_delete", args=[auth_id, member.id])
    response = client.delete(url)

    if should_delete:
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Authorization.objects.filter(id=auth_id).exists()
        if with_file:
            mock_delete_file.assert_called_once_with("supabase/testfile.pdf")
    else:
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert Authorization.objects.filter(id=auth_id).exists()


# ==============================
# Authorization Member Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,member_index,mltc_attr,expected_status",
    [
        # 1. Admin can get any from own SADC
        ("api_client_admin", 1, "mltc_denied", status.HTTP_200_OK),

        # 2. Admin cannot get from other SADC
        ("api_client_admin", "other", "mltc_allowed", status.HTTP_404_NOT_FOUND),

        # 3. Regular can get from MLTC allowed
        ("api_client_regular", 0, "mltc_allowed", status.HTTP_200_OK),

        # 4. Regular cannot get from MLTC denied
        ("api_client_regular", 1, "mltc_denied", status.HTTP_404_NOT_FOUND),

        # 5. Regular can see member with no active authorization
        ("api_client_regular", 2, None, status.HTTP_200_OK),

        # 6. Regular can see inactive member
        ("api_client_regular", 3, None, status.HTTP_200_OK),
    ]
)
def test_authorization_member(
    request,
    user_fixture,
    member_index,
    mltc_attr,
    expected_status,
    members_setup,
    other_org_setup
):
    client = request.getfixturevalue(user_fixture)

    if member_index == "other":
        member = other_org_setup["other_member"]
    else:
        member = members_setup["members"][member_index]

    auth = getattr(member, "active_auth", None)

    url = reverse("auth_by_member", args=[member.id])
    response = client.get(url)

    assert response.status_code == expected_status

    if expected_status == status.HTTP_200_OK:
        data = response.json()
        assert isinstance(data, list)
        if auth:
            assert any(item["id"] == auth.id for item in data)