import io
import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework import status
from backend.apps.core.models.member_model import Member
from unittest.mock import patch

# ==============================
# Member List Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,mltc_attr,other_sadc_flag,should_see,member_index",
    [
        # 1. Admin can get any from own SADC
        ("api_client_admin", "mltc_denied", False, True, 0),

        # 2. Admin cannot get from other SADC
        ("api_client_admin", "mltc_allowed", True, False, 0),

        # 3. Regular can get from MLTC allowed
        ("api_client_regular", "mltc_allowed", False, True, 0),

        # 4. Regular cannot get from MLTC denied
        ("api_client_regular", "mltc_denied", False, False, 1),

        # 5. Regular can get from member with no active authorization
        ("api_client_regular", "mltc_allowed", False, True, 2),

        # 6. Regular can get from inactive member
        ("api_client_regular", "mltc_allowed", False, True, 3),
    ]
)
def test_member_list(
    request,
    user_fixture,
    mltc_attr,
    other_sadc_flag,
    should_see,
    member_index,
    members_setup,
    org_setup,
    other_org_setup
):
    client = request.getfixturevalue(user_fixture)

    # Pick member
    if other_sadc_flag:
        member = other_org_setup["other_member"]
    else:
        member = members_setup["members"][member_index]

    url = reverse("members")
    response = client.get(url)
    assert response.status_code == status.HTTP_200_OK

    # Flatten the members dict
    flat_members = sum(response.data.values(), [])

    if should_see:
        # Check that the expected member is included
        assert any(m["id"] == member.id for m in flat_members)
    else:
        # Check that the expected member is NOT included
        assert all(m["id"] != member.id for m in flat_members)

# ==============================
# Member Detail Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,mltc_attr,other_sadc_flag,should_see,not_found,member_index",
    [
        # 1. Admin can get any from own SADC
        ("api_client_admin", "mltc_denied", False, True, False, 0),

        # 2. Admin cannot get from other SADC
        ("api_client_admin", "mltc_allowed", True, False, False, 0),

        # 3. Regular can get from MLTC allowed
        ("api_client_regular", "mltc_allowed", False, True, False, 0),

        # 4. Regular cannot get from MLTC denied
        ("api_client_regular", "mltc_denied", False, False, False, 1),

        # 5. Regular can get from member with no active authorization
        ("api_client_regular", "mltc_allowed", False, True, False, 2),

        # 6. Regular can get from inactive member
        ("api_client_regular", "mltc_allowed", False, True, False, 3),

        # 7. Member not found
        ("api_client_regular", "mltc_allowed", False, False, True, None),
    ]
)
def test_member_detail(
    request,
    user_fixture,
    mltc_attr,
    other_sadc_flag,
    should_see,
    not_found,
    member_index,
    members_setup,
    org_setup,
    other_org_setup
):
    client = request.getfixturevalue(user_fixture)

    # Handle not found case
    if not_found:
        url = reverse("member", args=[9999])  # non-existent member ID
        response = client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND
        return

    # Pick the correct member
    if other_sadc_flag:
        member = other_org_setup["other_member"]
    else:
        member = members_setup["members"][member_index]

    url = reverse("member", args=[member.id])
    response = client.get(url)

    if should_see:
        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == member.id
        assert response.data["first_name"] == member.first_name
        assert response.data["last_name"] == member.last_name
    else:
        assert response.status_code == status.HTTP_403_FORBIDDEN

# ==============================
# Member Create Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,other_sadc_flag,should_create,with_file",
    [
        # 1. Admin can create for own SADC
        ("api_client_admin", False, True, False),

        # 2. Admin cannot create for other SADC, always becomes user's SADC
        ("api_client_admin", True, True, False),

        # 3. Regular can create for own SADC
        ("api_client_regular", False, True, False),

        # 4. Regular cannot create for other SADC, always becomes user's SADC
        ("api_client_regular", True, True, False),

        # 5. File upload (regular, own SADC)
        ("api_client_regular", False, True, True),
    ]
)
@patch("backend.apps.core.utils.member_utils.upload_file_to_supabase")
def test_member_create(
    mock_upload,
    request,
    user_fixture,
    other_sadc_flag,
    should_create,
    with_file,
    members_setup,
    org_setup,
    other_org_setup,
):
    client = request.getfixturevalue(user_fixture)

    # Pick the SADC for payload
    if other_sadc_flag:
        sadc = other_org_setup["other_sadc"]
    else:
        sadc = org_setup["sadc"]

    url = reverse("members")
    payload = {
        "sadc": sadc.id,
        "sadc_member_id": "99",
        "first_name": "Test",
        "last_name": "User",
        "birth_date": "1990-01-01",
        "gender": "M",
    }

    files = None
    if with_file:
        mock_upload.return_value = ("https://supabase.test/photo.jpg", None)
        photo_file = SimpleUploadedFile(
            "photo.jpg",
            content=b"fake-image-content",
            content_type="image/jpeg"
        )
        files = {"photo": photo_file}

    response = client.post(
        url,
        data={**payload, **(files or {})},
        format="multipart" if with_file else "json"
    )

    if should_create:
        assert response.status_code == status.HTTP_201_CREATED
        member = Member.objects.get(first_name="Test", last_name="User")
        if with_file:
            assert member.photo == "https://supabase.test/photo.jpg"
            mock_upload.assert_called_once()
    else:
        # unauthorized should return 403
        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert not Member.objects.filter(first_name="Test", last_name="User").exists()

# ==============================
# Member Update Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,mltc_attr,other_sadc_flag,should_update,with_file",
    [
        # 1. Admin can update own SADC
        ("api_client_admin", "mltc_denied", False, True, False),

        # 2. Admin cannot update other SADC
        ("api_client_admin", "mltc_allowed", True, False, False),

        # 3. Regular can update allowed MLTC
        ("api_client_regular", "mltc_allowed", False, True, False),

        # 4. Regular cannot update denied MLTC
        ("api_client_regular", "mltc_denied", False, False, False),

        # 5. File upload (regular, allowed MLTC)
        ("api_client_regular", "mltc_allowed", False, True, True),

        # 6. Admin can update with file
        ("api_client_admin", "mltc_denied", False, True, True),
    ]
)
@patch("backend.apps.core.utils.member_utils.upload_file_to_supabase")
def test_member_update(
    mock_upload,
    request,
    user_fixture,
    mltc_attr,
    other_sadc_flag,
    should_update,
    with_file,
    members_setup,
    org_setup,
    other_org_setup,
):
    client = request.getfixturevalue(user_fixture)

    # Pick the correct member from fixtures
    if other_sadc_flag:
        member = other_org_setup["other_member"]
    else:
        member = members_setup["members"][0] if mltc_attr == "mltc_allowed" else members_setup["members"][1]

    url = reverse("member", args=[member.id])
    payload = {
        "sadc": member.sadc.id,
        "sadc_member_id": member.sadc_member_id,
        "first_name": "Updated",
        "last_name": member.last_name,
        "birth_date": str(member.birth_date),
        "gender": member.gender,
        "active": member.active,
    }

    files = None
    if with_file:
        mock_upload.return_value = ("https://supabase.test/photo.jpg", None)
        photo_file = SimpleUploadedFile(
            "photo.jpg",
            content=b"fake-image-content",
            content_type="image/jpeg"
        )
        files = {"photo": photo_file}

    response = client.put(
        url,
        data={**payload, **(files or {})},
        format="multipart" if with_file else "json"
    )

    if should_update:
        assert response.status_code == status.HTTP_200_OK
        member.refresh_from_db()
        assert member.first_name == "Updated"
        if with_file:
            assert member.photo == "https://supabase.test/photo.jpg"
            mock_upload.assert_called_once()
    else:
        assert response.status_code == status.HTTP_403_FORBIDDEN
        member.refresh_from_db()
        assert member.first_name != "Updated"


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
# Member Active Auth Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,mltc_attr,other_sadc_flag,should_see,not_found,member_index",
    [
        # 1. Admin can see active auth from own SADC (allowed)
        ("api_client_admin", "mltc_denied", False, True, False, 0),

        # 2. Admin cannot see from other SADC
        ("api_client_admin", "mltc_allowed", True, False, False, 0),

        # 3. Regular can see allowed MLTC
        ("api_client_regular", "mltc_allowed", False, True, False, 0),

        # 4. Regular cannot see denied MLTC
        ("api_client_regular", "mltc_denied", False, False, False, 1),

        # 5. Regular can see member with no active auth
        ("api_client_regular", "mltc_allowed", False, True, False, 2),

        # 6. Regular can see inactive member
        ("api_client_regular", "mltc_allowed", False, True, False, 3),
        
        # 7. Member not found
        ("api_client_regular", "mltc_allowed", False, False, True, None),
    ]
)
def test_member_auth(
    request,
    user_fixture,
    mltc_attr,
    other_sadc_flag,
    should_see,
    not_found,
    member_index,
    members_setup,
    other_org_setup,
):
    client = request.getfixturevalue(user_fixture)

    # Handle not found case
    if not_found:
        url = reverse("member_auth", args=[9999])
        response = client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND
        return

    # Pick member
    if other_sadc_flag:
        member = other_org_setup["other_member"]
    else:
        member = members_setup["members"][member_index]

    url = reverse("member_auth", args=[member.id])
    response = client.get(url)

    if should_see:
        assert response.status_code == status.HTTP_200_OK
        if member.active_auth:
            assert "mltc_member_id" in response.data
            assert response.data["id"] == member.active_auth.id
        else:
            # member with no active auth should return empty dict
            assert response.data == {}
    else:
        assert response.status_code == status.HTTP_403_FORBIDDEN


# ==============================
# Member Delete Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,mltc_attr,other_sadc_flag,should_delete,member_index",
    [
        # 1. Admin can delete own SADC member
        ("api_client_admin", "mltc_allowed", False, True, 0),

        # 2. Admin cannot delete other SADC member
        ("api_client_admin", "mltc_allowed", True, False, 0),

        # 3. Regular can delete allowed MLTC member
        ("api_client_regular", "mltc_allowed", False, True, 0),

        # 4. Regular cannot delete denied MLTC member
        ("api_client_regular", "mltc_denied", False, False, 1),

        # 5. Regular can delete member with no active authorization
        ("api_client_regular", "mltc_allowed", False, True, 2),

        # 6. Regular can delete inactive member
        ("api_client_regular", "mltc_allowed", False, True, 3),

        # 7. Member not found
        ("api_client_regular", "mltc_allowed", False, False, None),
    ]
)
def test_member_delete(
    request,
    user_fixture,
    mltc_attr,
    other_sadc_flag,
    should_delete,
    member_index,
    members_setup,
    other_org_setup,
):
    client = request.getfixturevalue(user_fixture)

    # Pick member to attempt delete
    if member_index is None:
        # Simulate non-existent member
        member_id = 99999
    elif other_sadc_flag:
        member = other_org_setup["other_member"]
        member_id = member.id
    else:
        member = members_setup["members"][member_index]
        member_id = member.id

    url = reverse("member", args=[member_id])
    response = client.delete(url)

    if should_delete:
        assert response.status_code == status.HTTP_204_NO_CONTENT
        member.refresh_from_db()
        assert member.is_deleted is True
    else:
        assert response.status_code == status.HTTP_403_FORBIDDEN
        if member_index is not None:
            member.refresh_from_db()
            assert member.is_deleted is False

# ==============================
# Member Restore Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,mltc_attr,other_sadc_flag,should_restore,member_index",
    [
        # 1. Admin can restore own SADC member
        ("api_client_admin", "mltc_allowed", False, True, 0),

        # 2. Admin cannot restore other SADC member
        ("api_client_admin", "mltc_allowed", True, False, 0),

        # 3. Regular can restore allowed MLTC member
        ("api_client_regular", "mltc_allowed", False, True, 0),

        # 4. Regular cannot restore denied MLTC member
        ("api_client_regular", "mltc_denied", False, False, 1),

        # 5. Regular can restore member with no active authorization
        ("api_client_regular", "mltc_allowed", False, True, 2),

        # 6. Regular can restore inactive member
        ("api_client_regular", "mltc_allowed", False, True, 3),

        # 7. Member not found
        ("api_client_regular", "mltc_allowed", False, False, None),
    ]
)
def test_member_restore(
    request,
    user_fixture,
    mltc_attr,
    other_sadc_flag,
    should_restore,
    member_index,
    members_setup,
    other_org_setup,
):
    client = request.getfixturevalue(user_fixture)

    # Pick member to attempt restore
    if member_index is None:
        # Simulate non-existent member
        member_id = 99999
    elif other_sadc_flag:
        member = other_org_setup["other_member"]
        # Ensure member is soft-deleted for restore test
        member.soft_delete()
        member_id = member.id
    else:
        member = members_setup["members"][member_index]
        member.soft_delete()  # make sure it's deletable for restore
        member_id = member.id

    url = reverse("member", args=[member_id])
    response = client.patch(url)

    if should_restore:
        assert response.status_code == status.HTTP_200_OK
        member.refresh_from_db()
        assert member.is_deleted is False
    else:
        assert response.status_code == status.HTTP_403_FORBIDDEN
        if member_index is not None:
            member.refresh_from_db()
            assert member.is_deleted is True


# ==============================
# Member Active Toggle Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,mltc_attr,other_sadc_flag,should_toggle,member_index",
    [
        # 1. Admin can toggle own SADC member
        ("api_client_admin", "mltc_allowed", False, True, 0),

        # 2. Admin cannot toggle other SADC member
        ("api_client_admin", "mltc_allowed", True, False, 0),

        # 3. Regular can toggle allowed MLTC member
        ("api_client_regular", "mltc_allowed", False, True, 0),

        # 4. Regular cannot toggle denied MLTC member
        ("api_client_regular", "mltc_denied", False, False, 1),

        # 5. Regular can toggle member with no active authorization
        ("api_client_regular", "mltc_allowed", False, True, 2),

        # 6. Regular can toggle inactive member
        ("api_client_regular", "mltc_allowed", False, True, 3),

        # 7. Member not found
        ("api_client_regular", "mltc_allowed", False, False, None),
    ]
)
def test_member_active_toggle(
    request,
    user_fixture,
    mltc_attr,
    other_sadc_flag,
    should_toggle,
    member_index,
    members_setup,
    other_org_setup,
):
    client = request.getfixturevalue(user_fixture)

    # Pick member to attempt toggle
    if member_index is None:
        member_id = 99999  # Non-existent
    elif other_sadc_flag:
        member = other_org_setup["other_member"]
        member_id = member.id
    else:
        member = members_setup["members"][member_index]
        member_id = member.id

    url = reverse("member_status", args=[member_id])
    response = client.patch(url)

    if should_toggle:
        assert response.status_code == status.HTTP_200_OK
        member.refresh_from_db()
        assert response.data["active"] == member.active
    else:
        assert response.status_code == status.HTTP_403_FORBIDDEN
        if member_index is not None:
            member.refresh_from_db()


# ==============================
# Member Profile Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,mltc_attr,other_sadc_flag,should_get,member_index",
    [
        # 1. Admin can get own SADC member
        ("api_client_admin", "mltc_allowed", False, True, 0),

        # 2. Admin cannot get other SADC member
        ("api_client_admin", "mltc_allowed", True, False, 0),

        # 3. Regular can get allowed MLTC member
        ("api_client_regular", "mltc_allowed", False, True, 0),

        # 4. Regular cannot get denied MLTC member
        ("api_client_regular", "mltc_denied", False, False, 1),

        # 5. Regular can get member with no active authorization
        ("api_client_regular", "mltc_allowed", False, True, 2),

        # 6. Regular can get inactive member
        ("api_client_regular", "mltc_allowed", False, True, 3),

        # 7. Member not found
        ("api_client_regular", "mltc_allowed", False, False, None),
    ]
)
def test_member_profile(
    request,
    user_fixture,
    mltc_attr,
    other_sadc_flag,
    should_get,
    member_index,
    members_setup,
    other_org_setup,
):
    client = request.getfixturevalue(user_fixture)

    if member_index is None:
        member_id = 99999  # Non-existent
    elif other_sadc_flag:
        member = other_org_setup["other_member"]
        member_id = member.id
    else:
        member = members_setup["members"][member_index]
        member_id = member.id

    url = reverse("member_profile", args=[member_id])
    response = client.get(url)

    if should_get:
        assert response.status_code == status.HTTP_200_OK
        if member_index is not None and not other_sadc_flag:
            assert response.data["info"]["id"] == member.id
    else:
        assert response.status_code == status.HTTP_403_FORBIDDEN

# ==============================
# Member Deleted List Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,mltc_attr,other_sadc_flag,should_get,member_index",
    [
        # 1. Admin can get any from own SADC
        ("api_client_admin", "mltc_denied", False, True, 0),

        # 2. Admin cannot get from other SADC
        ("api_client_admin", "mltc_allowed", True, False, 0),

        # 3. Regular can get from MLTC allowed
        ("api_client_regular", "mltc_allowed", False, True, 0),

        # 4. Regular cannot get from MLTC denied
        ("api_client_regular", "mltc_denied", False, False, 1),

        # 5. Regular can get from member with no active authorization
        ("api_client_regular", "mltc_allowed", False, True, 2),

        # 6. Regular can get from inactive member
        ("api_client_regular", "mltc_allowed", False, True, 3),
    ]
)
def test_member_deleted_list(
    request,
    user_fixture,
    mltc_attr,
    other_sadc_flag,
    should_get,
    member_index,
    members_setup,
    other_org_setup
):
    client = request.getfixturevalue(user_fixture)

    # pick the correct member to soft delete
    if other_sadc_flag:
        member = other_org_setup["other_member"]
    else:
        member = members_setup["members"][member_index]

    # soft delete the member
    member.soft_delete()

    url = reverse("members_deleted")
    response = client.get(url)

    # Always 200 OK
    assert response.status_code == status.HTTP_200_OK

    if should_get:
        # the member should appear in the results
        assert any(m['id'] == member.id for m in response.data)
    else:
        # the member should NOT appear
        assert all(m['id'] != member.id for m in response.data)

# ==============================
# Member Reports Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,expected_active_count",
    [
        # Admin counts all active members with active_auth
        ("api_client_admin", 2),   

        # Regular counts only members in allowed MLTC
        ("api_client_regular", 1), 
    ]
)
def test_member_stats(
    request, 
    user_fixture, 
    expected_active_count, 
    members_setup, 
    other_org_setup
):
    client = request.getfixturevalue(user_fixture)
    url = reverse("members_stats")
    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK
    data = response.data

    assert "active_count" in data
    assert "mltc_count" in data
    assert isinstance(data["mltc_count"], list)

    assert data["active_count"] == expected_active_count

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,mltc_attr,other_sadc_flag,should_see,member_index",
    [
        # 1. Admin can get any from own SADC, but only if birthday is in next 7 days
        ("api_client_admin", "mltc_denied", False, False, 0),

        # 2. Admin cannot get from other SADC
        ("api_client_admin", "mltc_allowed", True, False, 0),

        # 3. Regular can get from MLTC allowed, only if birthday in next 7 days
        ("api_client_regular", "mltc_allowed", False, False, 0),

        # 4. Regular cannot get from MLTC denied
        ("api_client_regular", "mltc_denied", False, False, 1),

        # 5. Regular cannot get member with no active authorization
        ("api_client_regular", "mltc_allowed", False, False, 2),

        # 6. Regular cannot get inactive member
        ("api_client_regular", "mltc_allowed", False, False, 3),
    ]
)
def test_member_birthdays(
    request, 
    user_fixture, 
    mltc_attr, 
    other_sadc_flag, 
    should_see, 
    member_index, 
    members_setup, 
    other_org_setup
):
    client = request.getfixturevalue(user_fixture)

    if other_sadc_flag:
        member = other_org_setup["other_member"]
    else:
        member = members_setup["members"][member_index]

    url = reverse("members_birthdays")
    response = client.get(url)

    assert response.status_code == 200
    assert isinstance(response.data, list)

    member_ids = [m["id"] for m in response.data]

    if should_see:
        assert member.active is True
        assert member.id in member_ids
    else:
        assert member.id not in member_ids

# ==============================
# Member CSV Tests
# ==============================

@pytest.mark.django_db
def test_member_export(
    api_client_admin
):
    url = reverse("members_csv")
    response = api_client_admin.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert "text/csv" in response["Content-Type"]

@pytest.mark.django_db
def test_member_export(
    api_client_admin, 
    org_setup
):
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