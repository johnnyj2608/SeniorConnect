import io
import pytest
from unittest.mock import patch
from django.urls import reverse
from rest_framework import status
from backend.apps.core.models.file_model import File

# ==============================
# Files Listing Tests
# ==============================

@pytest.mark.django_db
def test_get_files_list(api_client_regular, members_setup):
    member = members_setup["members"][0]
    File.objects.create(member=member, name="Consent Form", date="2024-01-01", file="https://test.com/file1.pdf")

    url = reverse("files")
    response = api_client_regular.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]["name"] == "Consent Form"

# ==============================
# Files Detail Tests
# ==============================

@pytest.mark.django_db
def test_get_file_detail(api_client_regular, members_setup):
    member = members_setup["members"][0]
    file_obj = File.objects.create(member=member, name="Plan", date="2024-01-01", file="https://test.com/plan.pdf")

    url = reverse("file", args=[file_obj.id])
    response = api_client_regular.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert response.data["name"] == "Plan"

@pytest.mark.django_db
def test_user_cannot_access_other_org_files(api_client_regular, other_org_setup):
    other_member = other_org_setup["other_member"]
    file_obj = File.objects.create(member=other_member, name="Other File", date="2024-01-01", file="https://test.com/other.pdf")

    url = reverse("file", args=[file_obj.id])
    response = api_client_regular.get(url)
    assert response.status_code == status.HTTP_403_FORBIDDEN

@pytest.mark.django_db
def test_regular_user_cannot_access_denied_mltc_files(api_client_regular, members_setup):
    denied_member = members_setup["members"][1]
    denied_file = File.objects.create(
        member=denied_member,
        name="Denied File",
        date="2024-01-01",
        file="https://test.com/denied.pdf",
    )

    url = reverse("files")
    response = api_client_regular.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert all(f["id"] != denied_file.id for f in response.data)

    url = reverse("file", args=[denied_file.id])
    response = api_client_regular.get(url)
    assert response.status_code == status.HTTP_403_FORBIDDEN

# ==============================
# Files Create Tests
# ==============================

@pytest.mark.django_db
@patch("backend.apps.core.utils.file_utils.upload_file_to_supabase")
def test_create_file_with_upload(mock_upload, api_client_regular, members_setup):
    member = members_setup["members"][0]
    mock_upload.return_value = ("https://supabase.test/newfile.pdf", None)

    url = reverse("files")
    file_content = io.BytesIO(b"dummy data")
    file_content.name = "document.pdf"

    payload = {"member": member.id, "name": "Health Form", "date": "2024-01-01"}
    response = api_client_regular.post(url, data={**payload, "file": file_content}, format="multipart")

    assert response.status_code == status.HTTP_201_CREATED
    assert File.objects.filter(member=member, name="Health Form").exists()
    mock_upload.assert_called_once()

@pytest.mark.django_db
@patch("backend.apps.core.utils.file_utils.upload_file_to_supabase")
def test_create_file_upload_failure(mock_upload, api_client_regular, members_setup):
    member = members_setup["members"][0]
    mock_upload.return_value = (None, "Upload error")

    url = reverse("files")
    file_content = io.BytesIO(b"dummy")
    file_content.name = "fail.pdf"
    payload = {"member": member.id, "name": "Fail File", "date": "2024-01-01"}

    response = api_client_regular.post(url, data={**payload, "file": file_content}, format="multipart")

    assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
    assert not File.objects.filter(member=member, name="Fail File").exists()

# ==============================
# Files Update Tests
# ==============================

@pytest.mark.django_db
@patch("backend.apps.core.utils.file_utils.upload_file_to_supabase")
def test_update_file_with_new_upload(mock_upload, api_client_regular, members_setup):
    member = members_setup["members"][0]
    file_obj = File.objects.create(member=member, name="Care Plan", date="2024-01-01", file="https://old.com/file.pdf")

    mock_upload.return_value = ("https://supabase.test/updated.pdf", None)

    url = reverse("file", args=[file_obj.id])
    new_file_content = io.BytesIO(b"updated file data")
    new_file_content.name = "updated.pdf"

    payload = {"member": member.id, "name": "Updated Care Plan", "date": "2024-01-01"}
    response = api_client_regular.put(url, data={**payload, "file": new_file_content}, format="multipart")

    assert response.status_code == status.HTTP_200_OK
    file_obj.refresh_from_db()
    assert file_obj.name == "Updated Care Plan"
    assert "supabase.test/updated.pdf" in file_obj.file
    mock_upload.assert_called_once()

# ==============================
# Files Delete Tests
# ==============================

@pytest.mark.django_db
@patch("backend.apps.core.utils.file_utils.delete_file_from_supabase")
def test_delete_file(mock_delete, api_client_regular, members_setup):
    member = members_setup["members"][0]
    file_obj = File.objects.create(member=member, name="To Delete", date="2024-01-01", file="https://test.com/delete.pdf")

    url = reverse("file_delete", args=[file_obj.id, member.id])
    response = api_client_regular.delete(url)

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not File.objects.filter(id=file_obj.id).exists()
    mock_delete.assert_called_once()

# ==============================
# Files Validation Tests
# ==============================

@pytest.mark.django_db
def test_create_file_missing_fields(api_client_regular, members_setup):
    member = members_setup["members"][0]
    url = reverse("files")
    response = api_client_regular.post(url, data={"member": member.id}, format="multipart")
    assert response.status_code == status.HTTP_400_BAD_REQUEST