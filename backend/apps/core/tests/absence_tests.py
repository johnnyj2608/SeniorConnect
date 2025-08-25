import io
import pytest
from unittest.mock import patch
from django.urls import reverse
from datetime import date, timedelta
from rest_framework import status
from backend.apps.core.models.absence_model import Absence, Assessment

# ==============================
# Absence List Tests
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
def test_absence_list(
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

    # Pick member based on index
    if other_sadc_flag:
        member = other_org_setup["other_member"]
    else:
        member = members_setup["members"][member_index]

    absence = Absence.objects.create(
        member=member,
        absence_type="vacation",
        start_date=date.today(),
    )

    url = reverse("absences")
    response = client.get(url)
    assert response.status_code == status.HTTP_200_OK

    if should_see:
        results = response.data["results"]
        assert any(a["id"] == absence.id for a in results)
    else:
        assert all(a["id"] != absence.id for a in response.data["results"])

# ==============================
# Absence Detail Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,mltc_attr,other_sadc_flag,should_see,not_found,member_index",
    [
        # 1. Admin can get any from own sadc
        ("api_client_admin", "mltc_denied", False, True, False, 0),

        # 2. Admin cannot get from other sadc
        ("api_client_admin", "mltc_allowed", True, False, False, 0),

        # 3. Regular can get from mltc allowed
        ("api_client_regular", "mltc_allowed", False, True, False, 0),

        # 4. Regular cannot get from mltc denied
        ("api_client_regular", "mltc_denied", False, False, False, 1),

        # 5. Regular can get from member with no active authorization
        ("api_client_regular", "mltc_allowed", False, True, False, 2),

        # 6. Regular can get from inactive member
        ("api_client_regular", "mltc_allowed", False, True, False, 3),

        # 7. Absence not found
        ("api_client_regular", "mltc_allowed", False, False, True, None),
    ]
)
def test_absence_detail(
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

    # Handle not found case
    if not_found:
        url = reverse("absence", args=[9999])  # non-existent id
        response = client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND
        return

    # Pick correct member based on index or other SADC
    if other_sadc_flag:
        member = other_org_setup["other_member"]
    else:
        member = members_setup["members"][member_index]

    absence = Absence.objects.create(
        member=member,
        absence_type="vacation",
        start_date=date.today(),
    )

    url = reverse("absence", args=[absence.id])
    response = client.get(url)

    if should_see:
        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == absence.id
        assert response.data["absence_type"] == "vacation"
    else:
        assert response.status_code == status.HTTP_403_FORBIDDEN


# ==============================
# Absence Create Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,mltc_attr,other_sadc_flag,should_create,with_file,absence_type",
    [
        # 1. Admin can create for own sadc
        ("api_client_admin", "mltc_denied", False, True, False, "vacation"),

        # 2. Admin cannot create for other sadc
        ("api_client_admin", "mltc_allowed", True, False, False, "vacation"),

        # 3. Regular can create for mltc allowed
        ("api_client_regular", "mltc_allowed", False, True, False, "vacation"),

        # 4. Regular cannot create for mltc denied
        ("api_client_regular", "mltc_denied", False, False, False, "vacation"),

        # 5. File upload (regular, allowed mltc)
        ("api_client_regular", "mltc_allowed", False, True, True, "vacation"),

        # 6. Assessment create (regular, allowed mltc)
        ("api_client_regular", "mltc_allowed", False, True, False, "assessment"),
    ]
)
@patch("backend.apps.core.utils.absence_utils.upload_file_to_supabase")
def test_absence_create(
    mock_upload,
    request,
    user_fixture,
    mltc_attr,
    other_sadc_flag,
    should_create,
    with_file,
    absence_type,
    members_setup,
    other_org_setup,
):
    client = request.getfixturevalue(user_fixture)

    # pick the correct member
    if other_sadc_flag:
        member = other_org_setup["other_member"]
    else:
        if mltc_attr == "mltc_allowed":
            member = members_setup["members"][0]  # allowed
        else:
            member = members_setup["members"][1]  # denied

    url = reverse("absences")
    payload = {
        "member": member.id,
        "absence_type": absence_type,
        "start_date": str(date.today()),
    }

    files = None
    if with_file:
        file_content = io.BytesIO(b"dummy data")
        file_content.name = "document.pdf"
        mock_upload.return_value = ("https://supabase.test/file.pdf", None)
        files = {"file": file_content}

    response = client.post(
        url,
        data={**payload, **(files or {})},
        format="multipart" if with_file else "json"
    )

    model_cls = Assessment if absence_type == "assessment" else Absence

    if should_create:
        assert response.status_code == status.HTTP_201_CREATED
        obj = model_cls.objects.get(member=member)
        assert obj.absence_type == absence_type

        if with_file:
            assert "supabase.test/file.pdf" in obj.file
            mock_upload.assert_called_once()
    else:
        # unauthorized should either be forbidden or validation fail
        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert not model_cls.objects.filter(member=member).exists()


# ==============================
# Absence Update Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,mltc_attr,other_sadc_flag,should_update,with_file,absence_type",
    [
        # 1. Admin can update own sadc
        ("api_client_admin", "mltc_denied", False, True, False, "vacation"),

        # 2. Admin cannot update other sadc
        ("api_client_admin", "mltc_allowed", True, False, False, "vacation"),

        # 3. Regular can update mltc allowed
        ("api_client_regular", "mltc_allowed", False, True, False, "vacation"),

        # 4. Regular cannot update mltc denied
        ("api_client_regular", "mltc_denied", False, False, False, "vacation"),

        # 5. File upload (regular, allowed mltc)
        ("api_client_regular", "mltc_allowed", False, True, True, "vacation"),

        # 6. Assessment update (regular, allowed mltc)
        ("api_client_regular", "mltc_allowed", False, True, False, "assessment"),
    ]
)
@patch("backend.apps.core.utils.absence_utils.upload_file_to_supabase")
def test_absence_update(
    mock_upload,
    request,
    user_fixture,
    mltc_attr,
    other_sadc_flag,
    should_update,
    with_file,
    absence_type,
    members_setup,
    other_org_setup,
):
    client = request.getfixturevalue(user_fixture)

    # pick correct member
    if other_sadc_flag:
        member = other_org_setup["other_member"]
    else:
        if mltc_attr == "mltc_allowed":
            member = members_setup["members"][0]  # allowed
        else:
            member = members_setup["members"][1]  # denied

    # Determine model class
    model_cls = Assessment if absence_type == "assessment" else Absence

    # Create initial record to update
    instance = model_cls.objects.create(
        member=member,
        absence_type="personal",
        start_date=date.today(),
    )

    url = reverse("absence", args=[instance.id])
    payload = {
        "member": member.id,
        "absence_type": "vacation" if absence_type == "vacation" else "assessment",
        "start_date": str(date.today()),
    }

    files = None
    if with_file:
        file_content = io.BytesIO(b"updated data")
        file_content.name = "updated.pdf"
        mock_upload.return_value = ("https://supabase.test/newfile.pdf", None)
        files = {"file": file_content}

    response = client.put(
        url,
        data={**payload, **(files or {})},
        format="multipart" if with_file else "json",
    )

    if should_update:
        assert response.status_code == status.HTTP_200_OK
        instance.refresh_from_db()
        assert instance.absence_type == payload["absence_type"]

        if with_file:
            assert "supabase.test/newfile.pdf" in instance.file
            mock_upload.assert_called_once()
    else:
        assert response.status_code == status.HTTP_403_FORBIDDEN
        instance.refresh_from_db()
        assert instance.absence_type == "personal"


# ==============================
# Absence Delete Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,mltc_attr,other_sadc_flag,should_delete,not_found,with_file",
    [
        # 1. Admin can delete mltc_allowed from own sadc
        ("api_client_admin", "mltc_denied", False, True, False, False),

        # 2. Admin cannot delete from other sadc
        ("api_client_admin", "mltc_allowed", True, False, False, False),

        # 3. Regular can delete from mltc allowed
        ("api_client_regular", "mltc_allowed", False, True, False, False),

        # 4. Regular cannot delete from mltc denied
        ("api_client_regular", "mltc_denied", False, False, False, False),

        # 5. Absence not found
        ("api_client_regular", "mltc_allowed", False, False, True, False),

        # 6. Delete with file
        ("api_client_admin", "mltc_allowed", False, True, False, True),
    ]
)
@patch("backend.apps.core.utils.absence_utils.delete_file_from_supabase")
def test_absence_delete(
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

    # Pick correct member
    if other_sadc_flag:
        member = other_org_setup["other_member"]
    else:
        if mltc_attr == "mltc_allowed":
            member = members_setup["members"][0]  # allowed
        else:
            member = members_setup["members"][1]  # denied

    # Only create absence if not testing "not found"
    if not not_found:
        file_url = "supabase/testfile.pdf" if with_file else None
        absence = Absence.objects.create(
            member=member,
            absence_type="vacation",
            start_date=date.today(),
            file=file_url,
        )
        absence_id = absence.id
    else:
        absence_id = 9999  # non-existent absence

    url = reverse("absence_delete", args=[absence_id, member.id])
    response = client.delete(url)

    if not_found:
        assert response.status_code == status.HTTP_404_NOT_FOUND

    elif should_delete:
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Absence.objects.filter(id=absence_id).exists()
        if with_file:
            mock_delete_file.assert_called_once_with("supabase/testfile.pdf")
    else:
        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert Absence.objects.filter(id=absence_id).exists()


# ==============================
# Absences Upcoming Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,mltc_attr,other_sadc_flag,should_see,member_index",
    [
        # 1. Admin can see own SADC
        ("api_client_admin", "mltc_denied", False, True, 0),

        # 2. Admin cannot see other SADC
        ("api_client_admin", "mltc_allowed", True, False, 0),

        # 3. Regular can see allowed MLTC
        ("api_client_regular", "mltc_allowed", False, True, 0),

        # 4. Regular cannot see denied MLTC
        ("api_client_regular", "mltc_denied", False, False, 1),

        # 5. Regular can see member with no active authorization
        ("api_client_regular", "mltc_allowed", False, True, 2),

        # 6. Regular can see inactive member
        ("api_client_regular", "mltc_allowed", False, True, 3),
    ]
)
def test_absence_upcoming(
    request,
    user_fixture,
    mltc_attr,
    other_sadc_flag,
    should_see,
    member_index,
    members_setup,
    other_org_setup,
):
    client = request.getfixturevalue(user_fixture)
    today = date.today()

    # Pick the correct member
    if other_sadc_flag:
        member = other_org_setup["other_member"]
    else:
        member = members_setup["members"][member_index]

    # Create test absences
    leaving_absence = Absence.objects.create(
        member=member,
        absence_type="vacation",
        start_date=today + timedelta(days=3),
    )
    returning_absence = Absence.objects.create(
        member=member,
        absence_type="personal",
        start_date=today - timedelta(days=2),
        end_date=today + timedelta(days=2),
    )

    url = reverse("absences_upcoming")
    response = client.get(url)

    if should_see:
        assert response.status_code == status.HTTP_200_OK
        leaving_ids = [a["id"] for a in response.data["leaving"]]
        returning_ids = [a["id"] for a in response.data["returning"]]

        # leaving absence should be in "leaving"
        assert leaving_absence.id in leaving_ids

        # returning absence should be in "returning"
        assert returning_absence.id in returning_ids
    else:
        # unauthorized access returns empty lists
        assert response.status_code == status.HTTP_200_OK
        assert response.data["leaving"] == []
        assert response.data["returning"] == []

# ==============================
# Absence Filtering Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "filter_value,expected_types",
    [
        # Ongoing absences (started already and not ended yet)
        ("ongoing", ["vacation", "personal", "hospital", "other"]),

        # Upcoming absences (start date in future)
        ("upcoming", ["vacation", "personal", "hospital", "other"]),

        # Completed absences (end date in past)
        ("completed", ["vacation", "personal", "hospital", "other"]),

        # Empty filter returns all types
        ("", ["vacation", "personal", "hospital", "other"]),
        (None, ["vacation", "personal", "hospital", "other"]),

        # Invalid filter returns empty result
        ("invalid", ["vacation", "personal", "hospital", "other"]),
    ]
)
def test_absence_filter(
    api_client_regular, 
    members_setup, 
    filter_value, 
    expected_types
):
    member = members_setup["members"][0]
    today = date.today()

    # Clear previous absences
    Absence.objects.all().delete()

    # Ongoing: started before today, no end or end >= today
    Absence.objects.create(member=member, absence_type="vacation", start_date=today - timedelta(days=2))
    Absence.objects.create(member=member, absence_type="personal", start_date=today - timedelta(days=1), end_date=today + timedelta(days=2))
    # Upcoming: start after today
    Absence.objects.create(member=member, absence_type="hospital", start_date=today + timedelta(days=3))
    # Completed: end before today
    Absence.objects.create(member=member, absence_type="other", start_date=today - timedelta(days=5), end_date=today - timedelta(days=1))
    # Assessment type (should be excluded)
    Absence.objects.create(member=member, absence_type="assessment", start_date=today)

    base_url = reverse("absences")
    url = f"{base_url}?filter={filter_value}" if filter_value else base_url
    resp = api_client_regular.get(url)
    assert resp.status_code == status.HTTP_200_OK

    returned_types = [a["absence_type"] for a in resp.data["results"]]

    if expected_types:
        for r_type in returned_types:
            assert r_type in expected_types
    else:
        assert returned_types == []

# ==============================
# Absence Pagination Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "total_absences,page,expected_status,expected_count,next_exists",
    [
        # Multiple pages
        (25, 1, status.HTTP_200_OK, 20, True),   # first page has 20 items
        (25, 2, status.HTTP_200_OK, 5, False),   # second page has 5 items
        # Requesting page beyond last
        (5, 2, status.HTTP_404_NOT_FOUND, 0, False),
    ]
)
def test_absence_pagination(
    api_client_regular, 
    members_setup, 
    total_absences, 
    page, 
    expected_status, 
    expected_count, 
    next_exists
):
    member = members_setup["members"][0]
    Absence.objects.all().delete()
    today = date.today()

    for i in range(total_absences):
        Absence.objects.create(
            member=member,
            absence_type="vacation",
            start_date=today - timedelta(days=i)
        )

    url = reverse("absences") + f"?page={page}"
    resp = api_client_regular.get(url)

    assert resp.status_code == expected_status
    if expected_status == status.HTTP_200_OK:
        assert len(resp.data["results"]) == expected_count
        if next_exists:
            assert resp.data["next"] is not None
        else:
            assert resp.data["next"] is None

# ==============================
# Assessment List Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,mltc_attr,other_sadc_flag,should_see,member_index",
    [
        # 1. Admin can see own SADC
        ("api_client_admin", "mltc_denied", False, True, 0),

        # 2. Admin cannot see other SADC
        ("api_client_admin", "mltc_allowed", True, False, 0),

        # 3. Regular can see allowed MLTC
        ("api_client_regular", "mltc_allowed", False, True, 0),

        # 4. Regular cannot see denied MLTC
        ("api_client_regular", "mltc_denied", False, False, 1),

        # 5. Regular can see member with no active authorization
        ("api_client_regular", "mltc_allowed", False, True, 2),

        # 6. Regular can see inactive member
        ("api_client_regular", "mltc_allowed", False, True, 3),
    ]
)
def test_assessment_list(
    request,
    user_fixture,
    mltc_attr,
    other_sadc_flag,
    should_see,
    member_index,
    members_setup,
    other_org_setup,
):
    client = request.getfixturevalue(user_fixture)

    # Pick the correct member
    if other_sadc_flag:
        member = other_org_setup["other_member"]
    else:
        member = members_setup["members"][member_index]

    # Create assessment
    assessment = Assessment.objects.create(
        member=member,
        absence_type="assessment",
        start_date=date.today(),
    )

    url = reverse("assessments")
    response = client.get(url)

    if should_see:
        assert response.status_code == status.HTTP_200_OK
        assert any(a["id"] == assessment.id for a in response.data["results"])
    else:
        assert response.status_code == status.HTTP_200_OK
        assert response.data["results"] == []

# ==============================
# Assessment Upcoming Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,mltc_attr,other_sadc_flag,should_see,member_index",
    [
        # 1. Admin can see own SADC
        ("api_client_admin", "mltc_denied", False, True, 0),

        # 2. Admin cannot see other SADC
        ("api_client_admin", "mltc_allowed", True, False, 0),

        # 3. Regular can see allowed MLTC
        ("api_client_regular", "mltc_allowed", False, True, 0),

        # 4. Regular cannot see denied MLTC
        ("api_client_regular", "mltc_denied", False, False, 1),

        # 5. Regular can see member with no active authorization
        ("api_client_regular", "mltc_allowed", False, True, 2),

        # 6. Regular can see inactive member
        ("api_client_regular", "mltc_allowed", False, True, 3),
    ]
)
def test_assessment_upcoming(
    request,
    user_fixture,
    mltc_attr,
    other_sadc_flag,
    should_see,
    member_index,
    members_setup,
    other_org_setup,
):
    client = request.getfixturevalue(user_fixture)
    today = date.today()

    # Pick the correct member
    if other_sadc_flag:
        member = other_org_setup["other_member"]
    else:
        member = members_setup["members"][member_index]

    # Create assessments
    upcoming_assessment = Assessment.objects.create(
        member=member,
        absence_type="assessment",
        start_date=today + timedelta(days=3),
    )
    past_assessment = Assessment.objects.create(
        member=member,
        absence_type="assessment",
        start_date=today - timedelta(days=5),
    )

    url = reverse("assessments_upcoming")
    response = client.get(url)

    if should_see:
        assert response.status_code == status.HTTP_200_OK
        ids = [a["id"] for a in response.data]
        assert upcoming_assessment.id in ids
        assert past_assessment.id not in ids
    else:
        assert response.status_code == status.HTTP_200_OK
        assert response.data == []

# ==============================
# Assessment Pagination Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "total_assessments,page,expected_status,expected_count,next_exists",
    [
        # Multiple pages
        (25, 1, status.HTTP_200_OK, 20, True),   # first page has 20 items
        (25, 2, status.HTTP_200_OK, 5, False),   # second page has 5 items
        # Requesting page beyond last
        (5, 2, status.HTTP_404_NOT_FOUND, 0, False),
    ]
)
def test_assessment_pagination(
    api_client_regular,
    members_setup,
    total_assessments,
    page,
    expected_status,
    expected_count,
    next_exists
):
    member = members_setup["members"][0]
    Assessment.objects.all().delete()
    today = date.today()

    # Create total_assessments number of assessments
    for i in range(total_assessments):
        Assessment.objects.create(
            member=member,
            absence_type="assessment",
            start_date=today - timedelta(days=i)
        )

    url = reverse("assessments") + f"?page={page}"
    resp = api_client_regular.get(url)

    assert resp.status_code == expected_status
    if expected_status == status.HTTP_200_OK:
        # Ensure the number of results matches expected
        assert len(resp.data["results"]) == expected_count
        # Check if next page exists or not
        if next_exists:
            assert resp.data["next"] is not None
        else:
            assert resp.data["next"] is None