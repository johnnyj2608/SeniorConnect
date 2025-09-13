import pytest
from datetime import date, timedelta
from django.utils import timezone
from rest_framework import status
from backend.apps.audit.models.enrollment_model import Enrollment
from django.urls import reverse

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,member_index,expected_in_results",
    [
        # Admin users
        ("api_client_admin", 0, True),          # same SADC
        ("api_client_admin", "other_member", False),  # other SADC

        # Regular users
        ("api_client_regular", 0, True),   # allowed MLTC
        ("api_client_regular", 1, False),  # denied MLTC
        ("api_client_regular", 2, True),   # no active authorization
        ("api_client_regular", 3, True),   # inactive member
    ]
)
def test_enrollment_list(
    request,
    members_setup,
    other_org_setup,
    user_fixture,
    member_index,
    expected_in_results
):
    if member_index == "other_member":
        member = other_org_setup["other_member"]
    else:
        member = members_setup["members"][member_index]

    Enrollment.objects.create(
        member_id=member.id,
        member_name=f"{member.last_name}, {member.first_name}",
        member_alt_name=getattr(member, "alt_name", None),
        change_type=Enrollment.ENROLLMENT,
        new_mltc=members_setup['mltc_allowed'].name,
    )

    client = request.getfixturevalue(user_fixture)

    url = reverse('enrollments')
    resp = client.get(url)
    assert resp.status_code == status.HTTP_200_OK

    member_ids = [e['member_id'] for e in resp.data['results']]

    if expected_in_results:
        assert member.id in member_ids
    else:
        assert member.id not in member_ids


# ==============================
# Enrollment Detail Test
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,member_index,enrollment_exists,expected_status",
    [
        # Admin users
        ("api_client_admin", 0, True, status.HTTP_200_OK),           # same SADC
        ("api_client_admin", "other_member", True, status.HTTP_404_NOT_FOUND),  # other SADC
        ("api_client_admin", 0, False, status.HTTP_404_NOT_FOUND),   # enrollment does not exist

        # Regular users
        ("api_client_regular", 0, True, status.HTTP_200_OK),         # allowed MLTC
        ("api_client_regular", 1, True, status.HTTP_404_NOT_FOUND),  # denied MLTC
        ("api_client_regular", 2, True, status.HTTP_200_OK),         # no active authorization
        ("api_client_regular", 3, True, status.HTTP_200_OK),         # inactive member
    ]
)
def test_enrollment_detail(
    request,
    members_setup,
    other_org_setup,
    user_fixture,
    member_index,
    enrollment_exists,
    expected_status
):
    # Resolve member
    if member_index == "other_member":
        member = other_org_setup["other_member"]
    else:
        member = members_setup["members"][member_index]

    # Create enrollment only if needed
    if enrollment_exists:
        enrollment = Enrollment.objects.create(
            member_id=member.id,
            member_name=f"{member.last_name}, {member.first_name}",
            member_alt_name=getattr(member, "alt_name", None),
            change_type=Enrollment.ENROLLMENT,
            new_mltc=members_setup['mltc_allowed'].name
        )
        enrollment_id = enrollment.id
    else:
        enrollment_id = 99999

    client = request.getfixturevalue(user_fixture)
    url = reverse('enrollment', kwargs={'pk': enrollment_id})
    resp = client.get(url)
    assert resp.status_code == expected_status

    if expected_status == status.HTTP_200_OK:
        assert resp.data['member_id'] == member.id
        assert resp.data['member_name'] == f"{member.last_name}, {member.first_name}"
        assert resp.data.get('member_alt_name') == getattr(member, 'alt_name', None)


# ==============================
# Enrollment Create Test
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,member_index,old_mltc,new_mltc,change_type,expected_status,expected_detail",
    [
        # Admin – valid actions
        ("api_client_admin", 0, None, "Allowed MLTC", Enrollment.ENROLLMENT, status.HTTP_201_CREATED, None),
        ("api_client_admin", 0, "Allowed MLTC", "Allowed MLTC", Enrollment.ENROLLMENT, status.HTTP_200_OK, "Extension, no action required."),
        ("api_client_admin", 0, "Allowed MLTC", None, Enrollment.DISENROLLMENT, status.HTTP_201_CREATED, None),
        ("api_client_admin", 0, "Allowed MLTC", "Denied MLTC", Enrollment.TRANSFER, status.HTTP_201_CREATED, None),

        # Admin – invalid inputs
        ("api_client_admin", 3, None, "Allowed MLTC", Enrollment.ENROLLMENT, status.HTTP_400_BAD_REQUEST, "Member is inactive; no transition performed."),
        ("api_client_admin", 0, None, None, Enrollment.ENROLLMENT, status.HTTP_400_BAD_REQUEST, "Invalid MLTC or missing data"),
        ("api_client_admin", 0, None, "Allowed MLTC", "INVALID_TYPE", status.HTTP_400_BAD_REQUEST, "Invalid change type."),

        # Regular user – can create 
        ("api_client_regular", 0, None, "Allowed MLTC", Enrollment.ENROLLMENT, status.HTTP_201_CREATED, None),
    ]
)
def test_enrollment_create(
    request,
    members_setup,
    user_fixture,
    member_index,
    old_mltc,
    new_mltc,
    change_type,
    expected_status,
    expected_detail
):
    client = request.getfixturevalue(user_fixture)
    member = members_setup["members"][member_index]

    data = {
        "member": member.id,
        "member_name": f"{member.last_name}, {member.first_name}",
        "member_alt_name": getattr(member, "alt_name", None),
        "change_type": change_type,
        "old_mltc": old_mltc,
        "new_mltc": new_mltc,
    }

    url = reverse('enrollments')
    resp = client.post(url, data, format='json')

    assert resp.status_code == expected_status

    if expected_detail:
        assert resp.data.get("detail") == expected_detail
    elif expected_status == status.HTTP_201_CREATED:
        assert Enrollment.objects.filter(member_id=member.id).exists()
    elif expected_status == status.HTTP_200_OK:
        assert Enrollment.objects.filter(member_id=member.id).count() == 1

# ==============================
# Enrollment Recent Test
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,member_index,days_ago,expected_visible",
    [
        # Admin – same SADC
        ("api_client_admin", 0, 0, True),       # today
        ("api_client_admin", 0, 6, True),       # within 7 days
        ("api_client_admin", 0, 8, False),      # older than 7 days

        # Admin – other SADC
        ("api_client_admin", "other_member", 0, False),  

        # Regular users
        ("api_client_regular", 0, 0, True),     # allowed MLTC
        ("api_client_regular", 1, 0, False),    # denied MLTC
        ("api_client_regular", 2, 0, True),     # no active auth
        ("api_client_regular", 3, 0, True),     # inactive member
    ]
)
def test_enrollment_recent(
    request,
    members_setup,
    other_org_setup,
    user_fixture,
    member_index,
    days_ago,
    expected_visible
):
    from backend.apps.audit.models.enrollment_model import Enrollment
    from django.utils import timezone
    from datetime import timedelta
    from django.urls import reverse
    from rest_framework import status

    Enrollment.objects.all().delete()

    if member_index == "other_member":
        member = other_org_setup["other_member"]
    else:
        member = members_setup["members"][member_index]

    change_date = (timezone.now() - timedelta(days=days_ago)).date()

    Enrollment.objects.create(
        member_id=member.id,
        member_name=f"{member.last_name}, {member.first_name}",
        member_alt_name=getattr(member, "alt_name", None),
        change_type=Enrollment.ENROLLMENT,
        new_mltc=members_setup['mltc_allowed'].name,
        change_date=change_date,
    )

    client = request.getfixturevalue(user_fixture)
    url = reverse('enrollments_recent')
    resp = client.get(url)
    assert resp.status_code == status.HTTP_200_OK

    member_ids_in_response = [e['member_id'] for e in resp.data]

    if expected_visible:
        assert member.id in member_ids_in_response
    else:
        assert member.id not in member_ids_in_response


# ==============================
# Enrollment Filtering Test
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "filter_value,expected_types",
    [
        # Single types
        ("enrollment", ["ENROLLMENT"]),
        ("transfer", ["TRANSFER"]),
        ("disenrollment", ["DISENROLLMENT"]),

        # Multiple types
        ("enrollment,transfer", ["ENROLLMENT", "TRANSFER"]),
        ("transfer,DISENROLLMENT", ["TRANSFER", "DISENROLLMENT"]),

        # Case-insensitivity
        ("EnRoLlMeNt", ["ENROLLMENT"]),

        # Empty or missing filter returns all types
        ("", ["ENROLLMENT", "TRANSFER", "DISENROLLMENT"]),
        (None, ["ENROLLMENT", "TRANSFER", "DISENROLLMENT"]),

        # Invalid input
        ("invalid", []),
    ]
)
def test_enrollment_list_filter(
    api_client_admin, 
    members_setup, 
    filter_value, 
    expected_types
):
    m1, m2, m3, _ = members_setup["members"]

    Enrollment.objects.create(member_id=m1.id, change_type=Enrollment.ENROLLMENT, new_mltc=members_setup['mltc_allowed'])
    Enrollment.objects.create(member_id=m2.id, change_type=Enrollment.TRANSFER, old_mltc=members_setup['mltc_allowed'], new_mltc=members_setup['mltc_denied'])
    Enrollment.objects.create(member_id=m3.id, change_type=Enrollment.DISENROLLMENT, old_mltc=members_setup['mltc_denied'])

    base_url = reverse("enrollments")
    url = f"{base_url}?filter={filter_value}" if filter_value else base_url

    response = api_client_admin.get(url)
    assert response.status_code == status.HTTP_200_OK

    returned_types = [e["change_type"].upper() for e in response.data["results"]]
    
    if not expected_types:
        assert returned_types == []
    else:
        assert all(rt in expected_types for rt in returned_types)

# ==============================
# Enrollment Pagination Test
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "total_enrollments,page,expected_status,expected_count,next_exists",
    [
        # Multiple pages
        (25, 1, status.HTTP_200_OK, 20, True),   # first page
        (25, 2, status.HTTP_200_OK, 5, False),   # second page

        # Requesting page beyond last
        (5, 2, status.HTTP_404_NOT_FOUND, 0, False),
    ]
)
def test_enrollment_list_pagination(
    api_client_admin, 
    members_setup, 
    total_enrollments, 
    page, 
    expected_status, 
    expected_count, 
    next_exists
):
    m1 = members_setup["members"][0]
    Enrollment.objects.all().delete()
    for i in range(total_enrollments):
        Enrollment.objects.create(
            member_id=m1.id,
            change_type=Enrollment.ENROLLMENT,
            new_mltc=members_setup['mltc_allowed']
        )

    url = reverse("enrollments") + f"?page={page}"
    resp = api_client_admin.get(url)

    assert resp.status_code == expected_status
    if expected_status == 200:
        assert len(resp.data["results"]) == expected_count
        if next_exists:
            assert resp.data["next"] is not None
        else:
            assert resp.data["next"] is None

# ==============================
# Enrollment Stats Test
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "enroll_count,disenroll_count,expected_count",
    [
        # Only enrollments
        (1, 0, 1),

        # Only disenrollments
        (0, 1, -1),

        # Equal enrollments and disenrollments => net 0
        (2, 2, 0),
    ]
)
def test_current_month_enrollment_stats(
    api_client_admin, 
    members_setup, 
    enroll_count, 
    disenroll_count, 
    expected_count
):
    m1 = members_setup["members"][0]
    today = date.today()

    # Clear any existing enrollments
    Enrollment.objects.all().delete()

    # Create enrollments
    for _ in range(enroll_count):
        Enrollment.objects.create(
            member_id=m1.id,
            change_type=Enrollment.ENROLLMENT,
            new_mltc=members_setup['mltc_allowed'],
            change_date=today
        )

    # Create disenrollments
    for _ in range(disenroll_count):
        Enrollment.objects.create(
            member_id=m1.id,
            change_type=Enrollment.DISENROLLMENT,
            old_mltc=members_setup['mltc_allowed'],
            change_date=today
        )

    url = reverse("enrollments_stats")
    resp = api_client_admin.get(url)

    assert resp.status_code == status.HTTP_200_OK
    assert resp.data[members_setup['mltc_allowed'].name] == expected_count
    assert resp.data["Overall"] == expected_count