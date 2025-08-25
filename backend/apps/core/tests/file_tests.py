import io
import pytest
from unittest.mock import patch
from django.urls import reverse
from rest_framework import status
from backend.apps.core.models.file_model import File

# ==============================
# Files List Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,mltc_attr,other_sadc_flag,should_see,member_index",
    [
        # 1. Admin can get any from own SADC
        ("api_client_admin", "mltc_denied", False, True, 0),

        # 2. Admin cannot get from other SADC
        ("api_client_admin", "mltc_allowed", True, False, 0),

        # 3. Regular can get from mltc allowed
        ("api_client_regular", "mltc_allowed", False, True, 0),

        # 4. Regular cannot get from mltc denied
        ("api_client_regular", "mltc_denied", False, False, 1),

        # 5. Regular can get from member with no active authorization
        ("api_client_regular", "mltc_allowed", False, True, 2),

        # 6. Regular can get from inactive member
        ("api_client_regular", "mltc_allowed", False, True, 3),
    ]
)
def test_file_list(
    request,
    user_fixture,
    mltc_attr,
    other_sadc_flag,
    should_see,
    member_index,
    members_setup,
    org_setup,
    other_org_setup,
):
    client = request.getfixturevalue(user_fixture)

    # Pick member based on index or other SADC
    if other_sadc_flag:
        member = other_org_setup["other_member"]
    else:
        member = members_setup["members"][member_index]

    # Create a test file
    file = File.objects.create(
        member=member,
        name="Test File",
        date="2024-01-01",
        file="https://test.com/file1.pdf"
    )

    url = reverse("files")
    response = client.get(url)
    assert response.status_code == 200

    if should_see:
        results = response.data
        assert any(f["id"] == file.id for f in results)
    else:
        results = response.data
        assert all(f["id"] != file.id for f in results)

# ==============================
# Files Detail Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,mltc_attr,other_sadc_flag,should_see,not_found,member_index",
    [
        # 1. Admin can get any from own SADC
        ("api_client_admin", "mltc_denied", False, True, False, 0),

        # 2. Admin cannot get from other SADC
        ("api_client_admin", "mltc_allowed", True, False, False, 0),

        # 3. Regular can get from mltc allowed
        ("api_client_regular", "mltc_allowed", False, True, False, 0),

        # 4. Regular cannot get from mltc denied
        ("api_client_regular", "mltc_denied", False, False, False, 1),

        # 5. Regular can get from member with no active authorization
        ("api_client_regular", "mltc_allowed", False, True, False, 2),

        # 6. Regular can get from inactive member
        ("api_client_regular", "mltc_allowed", False, True, False, 3),

        # 7. File not found
        ("api_client_regular", "mltc_allowed", False, False, True, None),
    ]
)
def test_file_detail(
    request,
    user_fixture,
    mltc_attr,
    other_sadc_flag,
    should_see,
    not_found,
    member_index,
    members_setup,
    org_setup,
    other_org_setup,
):
    client = request.getfixturevalue(user_fixture)

    # Handle not-found case
    if not_found:
        url = reverse("file", args=[9999])  # non-existent file
        response = client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND
        return

    # Pick member based on index or other SADC
    if other_sadc_flag:
        member = other_org_setup["other_member"]
    else:
        member = members_setup["members"][member_index]

    # Create a test file
    file_obj = File.objects.create(
        member=member,
        name="Test File",
        date="2024-01-01",
        file="https://test.com/file.pdf",
    )

    url = reverse("file", args=[file_obj.id])
    response = client.get(url)

    if should_see:
        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == file_obj.id
        assert response.data["name"] == "Test File"
    else:
        assert response.status_code == status.HTTP_403_FORBIDDEN

# ==============================
# Files Create Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,mltc_attr,other_sadc_flag,should_create,file_upload",
    [
        # 1. Admin can create for own SADC, with file
        ("api_client_admin", "mltc_denied", False, True, True),
        # 2. Admin cannot create for other SADC, with file
        ("api_client_admin", "mltc_allowed", True, False, True),
        # 3. Regular user can create for allowed MLTC, with file
        ("api_client_regular", "mltc_allowed", False, True, True),
        # 4. Regular user cannot create for denied MLTC, with file
        ("api_client_regular", "mltc_denied", False, False, True),
        # 5. Missing file should fail (400), even if otherwise allowed
        ("api_client_regular", "mltc_allowed", False, False, False),
    ]
)
@patch("backend.apps.core.utils.file_utils.upload_file_to_supabase")
def test_file_create(
    mock_upload,
    request,
    user_fixture,
    mltc_attr,
    other_sadc_flag,
    should_create,
    file_upload,
    members_setup,
    other_org_setup,
):
    client = request.getfixturevalue(user_fixture)

    # Pick member based on MLTC attr or other SADC
    if other_sadc_flag:
        member = other_org_setup["other_member"]
    else:
        member = members_setup["members"][1] if mltc_attr == "mltc_denied" else members_setup["members"][0]

    url = reverse("files")
    payload = {"member": member.id, "name": "Health Form", "date": "2025-01-01"}

    # Prepare file
    if file_upload:
        file_content = io.BytesIO(b"dummy data")
        file_content.name = "document.pdf"
        mock_upload.return_value = ("https://supabase.test/newfile.pdf", None)
        payload["file"] = file_content

    response = client.post(url, data=payload, format="multipart")

    # Assertions
    if not file_upload:
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    elif should_create:
        assert response.status_code == status.HTTP_201_CREATED
        assert File.objects.filter(member=member, name="Health Form").exists()
        mock_upload.assert_called_once()
    else:
        assert response.status_code == status.HTTP_403_FORBIDDEN

# ==============================
# Files Update Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,mltc_attr,other_sadc_flag,should_update,file_upload",
    [
        # 1. Admin updates own SADC file, with new file
        ("api_client_admin", "mltc_denied", False, True, True),
        # 2. Admin cannot update file in another SADC
        ("api_client_admin", "mltc_allowed", True, False, True),
        # 3. Regular user updates allowed MLTC file, metadata only
        ("api_client_regular", "mltc_allowed", False, True, False),
        # 4. Regular user cannot update denied MLTC file
        ("api_client_regular", "mltc_denied", False, False, True),
        # 5. Regular user attempts update with missing file but allowed otherwise
        ("api_client_regular", "mltc_allowed", False, True, False),
    ]
)
@patch("backend.apps.core.utils.file_utils.upload_file_to_supabase")
def test_file_update(
    mock_upload,
    request,
    user_fixture,
    mltc_attr,
    other_sadc_flag,
    should_update,
    file_upload,
    members_setup,
    other_org_setup,
):
    client = request.getfixturevalue(user_fixture)

    # Pick member and existing file
    if other_sadc_flag:
        member = other_org_setup["other_member"]
    else:
        member = members_setup["members"][1] if mltc_attr == "mltc_denied" else members_setup["members"][0]

    existing_file = File.objects.create(
        member=member,
        name="Old Form",
        date="2024-01-01",
        file="https://supabase.test/oldfile.pdf",
    )

    url = reverse("file", args=[existing_file.id])
    payload = {
        "member": member.id,
        "name": "Updated Form",
        "date": "2025-01-01",
    }

    if file_upload:
        file_content = io.BytesIO(b"new dummy data")
        file_content.name = "updated_document.pdf"
        payload["file"] = file_content
        mock_upload.return_value = ("https://supabase.test/newfile.pdf", None)

    response = client.put(url, data=payload, format="multipart")

    # Assertions
    if should_update:
        assert response.status_code == status.HTTP_200_OK
        updated_file = File.objects.get(id=existing_file.id)
        assert updated_file.name == "Updated Form"
        if file_upload:
            assert updated_file.file == "https://supabase.test/newfile.pdf"
            mock_upload.assert_called_once()
    else:
        # Unauthorized or forbidden
        assert response.status_code == status.HTTP_403_FORBIDDEN

# ==============================
# Files Delete Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,mltc_attr,other_sadc_flag,should_delete,not_found",
    [
        # 1. Admin can delete own SADC file (mltc_denied)
        ("api_client_admin", "mltc_denied", False, True, False),
        # 2. Admin cannot delete file in other SADC
        ("api_client_admin", "mltc_allowed", True, False, False),
        # 3. Regular user can delete allowed MLTC file
        ("api_client_regular", "mltc_allowed", False, True, False),
        # 4. Regular user cannot delete denied MLTC file
        ("api_client_regular", "mltc_denied", False, False, False),
        # 5. File not found
        ("api_client_regular", "mltc_allowed", False, False, True),
    ]
)
@patch("backend.apps.core.utils.file_utils.delete_file_from_supabase")
def test_file_delete(
    mock_delete_file,
    request,
    user_fixture,
    mltc_attr,
    other_sadc_flag,
    should_delete,
    not_found,
    members_setup,
    org_setup,
    other_org_setup,
):
    client = request.getfixturevalue(user_fixture)

    # Pick member
    if other_sadc_flag:
        member = other_org_setup["other_member"]
    else:
        member = members_setup["members"][1] if mltc_attr == "mltc_denied" else members_setup["members"][0]

    # Only create file if not testing "not found"
    if not not_found:
        file_url = "https://supabase.test/testfile.pdf"
        file = File.objects.create(
            member=member,
            name="Test File",
            date="2025-01-01",
            file=file_url
        )
        file_id = file.id
    else:
        file_id = 9999  # non-existent

    url = reverse("file_delete", args=[file_id, member.id])
    response = client.delete(url)

    if not_found:
        assert response.status_code == status.HTTP_404_NOT_FOUND

    elif should_delete:
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not File.objects.filter(id=file_id).exists()
        # Expect the full URL now, not relative path
        mock_delete_file.assert_called_once_with(file_url)
    else:
        assert response.status_code == status.HTTP_403_FORBIDDEN
        if not not_found:
            assert File.objects.filter(id=file_id).exists()