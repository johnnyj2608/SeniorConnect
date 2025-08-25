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
        mltc_obj = other_org_setup["other_mltc_allowed"]
    else:
        if mltc_attr == "mltc_allowed":
            member = members_setup["members"][0]  # allowed
            mltc_obj = members_setup["mltc_allowed"]
        elif mltc_attr == "mltc_denied":
            member = members_setup["members"][1]  # denied
            mltc_obj = members_setup["mltc_denied"]
        else:
            # For no active auth or inactive member
            if not should_see:  # case 5
                member = members_setup["members"][2]  # no active auth
            else:  # case 6
                member = members_setup["members"][3]  # inactive member
            mltc_obj = None

    # Only create an authorization if MLTC exists
    if mltc_obj:
        Authorization.objects.create(
            member=member,
            mltc=mltc_obj,
            mltc_member_id="AUTH001",
            start_date=date.today(),
            end_date=date.today(),
            active=True,
            schedule=[]
        )

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

    # Handle not found case
    if not_found:
        url = reverse("auth", args=[9999])  # non-existent id
        response = client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND
        return

    # Pick correct member and MLTC object
    if other_sadc_flag:
        member = other_org_setup["other_member"]
        mltc_obj = other_org_setup["other_mltc_allowed"]
    else:
        if mltc_attr == "mltc_allowed":
            member = members_setup["members"][0]
            mltc_obj = members_setup["mltc_allowed"]
        else:
            member = members_setup["members"][1]
            mltc_obj = members_setup["mltc_denied"]

    # Create the authorization
    auth = Authorization.objects.create(
        member=member,
        mltc=mltc_obj,
        mltc_member_id="AUTH001",
        start_date=date.today(),
        end_date=date.today(),
        active=True,
        schedule=[]
    )

    url = reverse("auth", args=[auth.id])
    response = client.get(url)

    if should_see:
        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == auth.id
        assert response.data["mltc_member_id"] == "AUTH001"
        assert response.data["mltc"] == mltc_obj.name
    else:
        assert response.status_code == status.HTTP_404_NOT_FOUND

# ==============================
# Authorization Create Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,mltc_attr,other_sadc_flag,should_create,file_upload",
    [
        # 1. Admin can create for own SADC, allowed MLTC
        ("api_client_admin", "mltc_denied", False, True, False),

        # 2. Admin cannot create for other SADC, allowed MLTC
        ("api_client_admin", "mltc_allowed", True, False, False),

        # 3. Regular user can create for allowed MLTC
        ("api_client_regular", "mltc_allowed", False, True, False),

        # 4. Regular user cannot create for denied MLTC
        ("api_client_regular", "mltc_denied", False, False, False),
        
        # 5. Regular user can create for allowed MLTC WITH file upload
        ("api_client_regular", "mltc_allowed", False, True, True),
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
    members_setup, 
    other_org_setup
):
    client = request.getfixturevalue(user_fixture)

    # Choose member based on MLTC attr
    if other_sadc_flag:
        member = other_org_setup["other_member"]
        mltc = other_org_setup["other_mltc_allowed"]
    else:
        member = members_setup["members"][1] if mltc_attr == "mltc_denied" else members_setup["members"][0]
        mltc = members_setup[mltc_attr]

    # Prepare file if needed
    if file_upload:
        mock_upload_file.return_value = ("supabase/path/fakefile.pdf", None)
        file_content = io.BytesIO(b"dummy data")
        file_content.name = "dummyfile.pdf"
    else:
        file_content = None

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
    if file_content:
        payload["file"] = file_content

    response = client.post(url, data=payload, format="multipart")

    if should_create:
        assert response.status_code == status.HTTP_201_CREATED
        auth = Authorization.objects.get(member=member, mltc_member_id="M125")
        if file_upload:
            assert auth.file == "supabase/path/fakefile.pdf"
        assert auth.mltc == mltc
    else:
        assert response.status_code == status.HTTP_404_NOT_FOUND

# ==============================
# Authorization Update Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,mltc_attr,other_sadc_flag,should_update,file_upload",
    [
        # 1. Admin can update own SADC, allowed MLTC
        ("api_client_admin", "mltc_denied", False, True, False),

        # 2. Admin cannot update other SADC
        ("api_client_admin", "mltc_allowed", True, False, False),

        # 3. Regular user can update allowed MLTC
        ("api_client_regular", "mltc_allowed", False, True, False),

        # 4. Regular user cannot update denied MLTC
        ("api_client_regular", "mltc_denied", False, False, False),
        
        # 5. Regular user can update allowed MLTC WITH file
        ("api_client_regular", "mltc_allowed", False, True, True),
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

    # Create initial authorization
    auth = Authorization.objects.create(
        mltc=mltc,
        member=member,
        mltc_member_id="INIT1",
        start_date=date(2025, 1, 1),
        end_date=date(2025, 6, 30),
        schedule=[]
    )
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

    # Build payload
    payload = {
        "mltc": mltc.name,
        "member": str(member.id),  # must be string for multipart
        "mltc_member_id": "UPDATED1",
        "start_date": "2025-02-01",
        "end_date": "2025-08-31",
        "schedule": json.dumps([]),  # serialize list for form-data
        "services": json.dumps([{
            "id": service.id,
            "service_type": "sdc",
            "auth_id": "SVC1-UPDATED"
        }])
    }

    if file_content:
        payload["file"] = file_content

    url = reverse("auth", args=[auth.id])
    response = client.put(url, data=payload, format="multipart")

    if should_update:
        assert response.status_code == status.HTTP_200_OK
        auth.refresh_from_db()
        assert auth.mltc_member_id == "UPDATED1"
        # Check service update
        assert any(s.auth_id == "SVC1-UPDATED" for s in auth.services.all())
        if file_upload:
            assert auth.file == "https://supabase.test/updated.pdf"
    else:
        assert response.status_code == status.HTTP_404_NOT_FOUND
        auth.refresh_from_db()
        assert auth.mltc_member_id == "INIT1"

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
    org_setup,
    other_org_setup,
):
    client = request.getfixturevalue(user_fixture)

    # Pick member and MLTC
    if other_sadc_flag:
        member = other_org_setup["other_member"]
        mltc = other_org_setup["other_mltc_allowed"]
    else:
        member = members_setup["members"][1] if mltc_attr == "mltc_denied" else members_setup["members"][0]
        mltc = members_setup[mltc_attr]

    # Only create authorization if not testing "not found"
    if not not_found:
        file_url = "supabase/testfile.pdf" if with_file else None
        auth = Authorization.objects.create(
            mltc=mltc,
            member=member,
            mltc_member_id="TEST_DELETE",
            start_date=date.today(),
            end_date=date.today(),
            schedule=[],
            file=file_url,
        )
        auth_id = auth.id
    else:
        auth_id = 9999  # non-existent

    url = reverse("auth_delete", args=[auth_id, member.id])
    response = client.delete(url)

    if not_found:
        assert response.status_code == status.HTTP_404_NOT_FOUND

    elif should_delete:
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Authorization.objects.filter(id=auth_id).exists()
        if with_file:
            mock_delete_file.assert_called_once_with("supabase/testfile.pdf")
    else:
        assert response.status_code == status.HTTP_404_NOT_FOUND
        if not not_found:
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

        # 5. Regular cannot see member with no active authorization
        ("api_client_regular", 2, None, status.HTTP_200_OK),

        # 6. Regular cannot see inactive member
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

    # Pick member
    if member_index == "other":
        member = other_org_setup["other_member"]
        mltc = other_org_setup["other_mltc_allowed"] if mltc_attr else None        
    else:
        member = members_setup["members"][member_index]
        mltc = members_setup[mltc_attr] if mltc_attr else None

    # Create authorization only if applicable
    if mltc:
        Authorization.objects.create(
            mltc=mltc,
            member=member,
            mltc_member_id=f"TEST_{mltc.name}",
            start_date=date(2025, 1, 1),
            end_date=date(2025, 12, 31),
            schedule=[]
        )

    url = reverse("auth_by_member", args=[member.id])
    response = client.get(url)

    # Check status code
    assert response.status_code == expected_status

    # If 200 OK, the response should always be a list (can be empty)
    if expected_status == status.HTTP_200_OK:
        data = response.json()
        assert isinstance(data, list)