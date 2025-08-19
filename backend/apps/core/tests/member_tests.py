import io
import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework import status
from backend.apps.core.models.member_model import Member
from unittest.mock import patch

# ==============================
# Member Listing Tests
# ==============================

@pytest.mark.django_db
def test_get_member_list_admin(api_client_admin, members_setup):
    url = reverse("members")
    response = api_client_admin.get(url)
    assert response.status_code == status.HTTP_200_OK
    flat_members = sum(response.data.values(), [])
    assert len(flat_members) >= 4


@pytest.mark.django_db
def test_get_member_list_regular_user(api_client_regular, members_setup):
    url = reverse("members")
    response = api_client_regular.get(url)
    assert response.status_code == status.HTTP_200_OK
    flat_members = sum(response.data.values(), [])
    allowed, denied, noauth, inactive = members_setup["members"]
    ids = {m["id"] for m in flat_members}
    assert allowed.id in ids
    assert noauth.id in ids
    assert denied.id not in ids

@pytest.mark.django_db
def test_get_deleted_members_list(api_client_admin, members_setup):
    member = members_setup["members"][0]
    member.soft_delete()
    
    url = reverse("members_deleted")
    response = api_client_admin.get(url)
    
    assert response.status_code == 200
    assert any(m['id'] == member.id for m in response.data)

# ==============================
# Member Detail Tests
# ==============================

@pytest.mark.django_db
def test_get_member_detail_authorized(api_client_regular, members_setup):
    allowed_member = members_setup["members"][0]
    url = reverse("member", args=[allowed_member.id])
    response = api_client_regular.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data["id"] == allowed_member.id


@pytest.mark.django_db
def test_get_member_detail_unauthorized(api_client_regular, members_setup):
    denied_member = members_setup["members"][1]
    url = reverse("member", args=[denied_member.id])
    response = api_client_regular.get(url)
    assert response.status_code == status.HTTP_403_FORBIDDEN

@pytest.mark.django_db
def test_regular_user_cannot_access_other_sadc_member(api_client_regular, other_org_setup):
    other_member = other_org_setup['other_member']
    url = reverse("member", args=[other_member.id])
    response = api_client_regular.get(url)
    assert response.status_code == status.HTTP_403_FORBIDDEN

@pytest.mark.django_db
def test_get_active_auth_no_authorization(api_client_regular, members_setup):
    no_auth_member = members_setup['members'][2]
    url = reverse("member_auth", args=[no_auth_member.id])
    response = api_client_regular.get(url)
    assert response.status_code == 200
    assert response.data == {}

# ==============================
# Member Create Tests
# ==============================

@pytest.mark.django_db
def test_create_member(api_client_admin, org_setup):
    sadc = org_setup['sadc']
    url = reverse("members")
    payload = {
        "sadc": sadc.id,
        "sadc_member_id": "4",
        "first_name": "John",
        "last_name": "Doe",
        "birth_date": "1970-01-01",
        "gender": "M",
    }
    response = api_client_admin.post(url, data=payload)
    assert response.status_code == status.HTTP_201_CREATED
    assert Member.objects.filter(first_name="John", last_name="Doe").exists()

@pytest.mark.django_db
def test_create_member_missing_required_fields(api_client_admin, org_setup):
    url = reverse("members")
    payload = {"first_name": "Jane"}
    response = api_client_admin.post(url, data=payload)
    assert response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.django_db
@patch("backend.apps.core.utils.member_utils.upload_file_to_supabase")
def test_create_member_with_photo(mock_upload, api_client_admin, org_setup):
    mock_upload.return_value = ("https://fake.supabase.url/photo.jpg", None)

    sadc = org_setup['sadc']
    url = reverse("members")

    photo_file = SimpleUploadedFile(
        "test_photo.jpg",
        content=b"fake-image-content",
        content_type="image/jpeg"
    )

    payload = {
        "sadc": sadc.id,
        "sadc_member_id": "5",
        "first_name": "Alice",
        "last_name": "Smith",
        "birth_date": "1980-02-02",
        "gender": "F",
        "photo": photo_file,
    }

    response = api_client_admin.post(url, data=payload, format="multipart")

    assert response.status_code == status.HTTP_201_CREATED
    member = Member.objects.get(first_name="Alice", last_name="Smith")
    assert member.photo == "https://fake.supabase.url/photo.jpg"

# ==============================
# Member Update Tests
# ==============================

@pytest.mark.django_db
def test_update_member(api_client_admin, members_setup):
    member = members_setup["members"][0]
    url = reverse("member", args=[member.id])
    payload = {
        "sadc": member.sadc.id,
        "sadc_member_id": member.sadc_member_id,
        "first_name": "Updated",
        "last_name": member.last_name,
        "birth_date": member.birth_date,
        "gender": member.gender,
        "active": member.active,
    }
    response = api_client_admin.put(url, data=payload)
    assert response.status_code == status.HTTP_200_OK
    member.refresh_from_db()
    assert member.first_name == "Updated"


# ==============================
# Member Delete / Patch Tests
# ==============================

@pytest.mark.django_db
def test_delete_and_restore_member(api_client_admin, members_setup):
    member = members_setup["members"][0]
    url = reverse("member", args=[member.id])

    response = api_client_admin.delete(url)
    assert response.status_code == status.HTTP_204_NO_CONTENT
    member.refresh_from_db()
    assert member.is_deleted is True

    # Restore
    response = api_client_admin.patch(url)
    assert response.status_code == status.HTTP_200_OK
    member.refresh_from_db()
    assert member.is_deleted is False


@pytest.mark.django_db
def test_toggle_member_active_status(api_client_admin, members_setup):
    member = members_setup["members"][0]
    url = reverse("member_status", args=[member.id])

    response = api_client_admin.patch(url, data={"active": False})
    assert response.status_code == status.HTTP_200_OK
    member.refresh_from_db()
    assert member.active is False


# ==============================
# Member Profile Tests
# ==============================

@pytest.mark.django_db
def test_get_member_profile(api_client_admin, members_setup):
    member = members_setup["members"][0]
    url = reverse("member_profile", args=[member.id])
    response = api_client_admin.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data["info"]["id"] == member.id


# ==============================
# Member Reports Tests
# ==============================

@pytest.mark.django_db
def test_get_member_stats(api_client_admin):
    url = reverse("members_stats")
    response = api_client_admin.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert "active_count" in response.data


@pytest.mark.django_db
def test_get_member_birthdays(api_client_admin):
    url = reverse("members_birthdays")
    response = api_client_admin.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert isinstance(response.data, list)


# ==============================
# Member CSV Tests
# ==============================

@pytest.mark.django_db
def test_export_members_csv(api_client_admin):
    url = reverse("members_csv")
    response = api_client_admin.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert "text/csv" in response["Content-Type"]

@pytest.mark.django_db
def test_import_members_csv(api_client_admin, org_setup):
    csv_content = (
        "first_name,last_name,birth_date,gender,sadc_member_id\n"
        "Alice,Smith,1980-01-01,F,1\n"
        "Bob,Jones,1975-05-15,M,2\n"
    )
    file = io.BytesIO(csv_content.encode())
    file.name = "members.csv"

    url = reverse("members_csv")
    response = api_client_admin.post(url, {"file": file}, format='multipart')

    assert response.status_code == status.HTTP_200_OK
    assert Member.objects.filter(first_name="Alice", last_name="Smith").exists()
    assert Member.objects.filter(first_name="Bob", last_name="Jones").exists()