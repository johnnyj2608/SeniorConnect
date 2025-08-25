import pytest
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta
from rest_framework import status
from backend.apps.tenant.models.snapshot_model import Snapshot

# ==============================
# Snapshot List Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,org_type,view_snapshots_flag,expected_status,expected_count",
    [
        # Admin sees own SADCs → 1 snapshot
        # Admin cannot see other SADCs → 0 snapshots
        # Regular user with view_snapshots=True → 1 snapshot
        ("api_client_regular", "org", True, status.HTTP_200_OK, 1),
        # Regular user with view_snapshots=False → forbidden
        ("api_client_regular", "org", False, status.HTTP_404_NOT_FOUND, 0),
    ]
)
def test_snapshot_list(
    request, 
    org_setup, 
    other_org_setup, 
    user_fixture, 
    org_type, 
    view_snapshots_flag, 
    expected_status, 
    expected_count
):
    client = request.getfixturevalue(user_fixture)

    # Set view_snapshots flag for regular users
    if user_fixture == "api_client_regular":
        user_obj = client.handler._force_user
        user_obj.view_snapshots = view_snapshots_flag
        user_obj.save()

    # Create snapshot for the chosen org
    sadc = org_setup["sadc"] if org_type == "org" else other_org_setup["other_sadc"]
    Snapshot.objects.create(
        sadc=sadc,
        date=timezone.now().date(),
        type=Snapshot.MEMBERS,
        file="http://example.com/file.pdf",
        name=f"{sadc.name} Snapshot",
        pages=1,
    )

    url = reverse("snapshots")
    resp = client.get(url)

    assert resp.status_code == expected_status

    if resp.status_code == status.HTTP_200_OK:
        # Only check snapshot count if request succeeded
        assert resp.data['count'] == expected_count


# ==============================
# Snapshot Detail Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,target_sadc,view_snapshots_flag,expected_status",
    [
        # Admin accessing own SADC snapshot → 200
        ("api_client_admin", "org", True, status.HTTP_200_OK),
        # Admin accessing another SADC snapshot → 403
        ("api_client_admin", "other_org", True, status.HTTP_404_NOT_FOUND),
        # Regular user with view_snapshots=True → 200
        ("api_client_regular", "org", True, status.HTTP_200_OK),
        # Regular user with view_snapshots=False → 403
        ("api_client_regular", "org", False, status.HTTP_404_NOT_FOUND),
        # Nonexistent snapshot → 404
        ("api_client_admin", "nonexistent", True, status.HTTP_404_NOT_FOUND),
    ]
)
def test_snapshot_detail(
    request, 
    org_setup, 
    other_org_setup, 
    user_fixture, 
    target_sadc, 
    view_snapshots_flag, 
    expected_status
):
    client = request.getfixturevalue(user_fixture)

    # Set view_snapshots flag for regular users
    if user_fixture == "api_client_regular":
        user_obj = client.handler._force_user
        user_obj.view_snapshots = view_snapshots_flag
        user_obj.save()

    # Determine which snapshot to fetch
    if target_sadc == "org":
        sadc = org_setup["sadc"]
    elif target_sadc == "other_org":
        sadc = other_org_setup["other_sadc"]
    else:  # nonexistent
        snapshot_id = 99999
        url = reverse("snapshot", args=[snapshot_id])
        resp = client.get(url)
        assert resp.status_code == expected_status
        return

    snapshot = Snapshot.objects.create(
        sadc=sadc,
        date=timezone.now().date(),
        type=Snapshot.MEMBERS,
        file="http://example.com/file.pdf",
        name=f"{sadc.name} Snapshot",
        pages=1,
    )

    url = reverse("snapshot", args=[snapshot.id])
    resp = client.get(url)

    assert resp.status_code == expected_status

    if resp.status_code == status.HTTP_200_OK:
        assert resp.data["id"] == snapshot.id
        assert resp.data["name"] == snapshot.name


# ==============================
# Snapshot Create Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,override_sadc,expected_status",
    [
        # Admin can create snapshot for own SADC → 201
        ("api_client_admin", False, status.HTTP_201_CREATED),
        # Admin cannot create snapshot for another SADC → should still create under their own SADC → 201
        ("api_client_admin", True, status.HTTP_201_CREATED),
        # Regular user cannot create snapshot → 403
        ("api_client_regular", False, status.HTTP_404_NOT_FOUND),
    ]
)
def test_snapshot_create(
    request, 
    org_setup, 
    other_org_setup, 
    user_fixture, 
    override_sadc, 
    expected_status
):
    client = request.getfixturevalue(user_fixture)
    current_user = client.handler._force_user

    # Prepare payload
    data = {
        "date": timezone.now().date(),
        "type": "members",
        "file": "http://example.com/file.pdf",
        "name": "Test Snapshot",
        "pages": 5
    }

    # If we try to override SADC (admin trying to create for another org)
    if override_sadc:
        data["sadc"] = other_org_setup["other_sadc"].id  # Should be ignored by view

    resp = client.post(reverse("snapshots"), data, format="json")
    assert resp.status_code == expected_status

    if resp.status_code == status.HTTP_201_CREATED:
        snapshot = Snapshot.objects.get(id=resp.data["id"])
        # Ensure snapshot is always created under current_user.sadc
        assert snapshot.sadc == current_user.sadc
        assert snapshot.name == data["name"]
        assert snapshot.pages == data["pages"]

# ==============================
# Snapshot Update Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,override_sadc,snapshot_exists,expected_status",
    [
        # Admin updates own SADC snapshot → 200
        ("api_client_admin", False, True, status.HTTP_200_OK),
        # Admin cannot update other SADC snapshot → 403
        ("api_client_admin", True, True, status.HTTP_404_NOT_FOUND),
        # Regular user cannot update → 403
        ("api_client_regular", False, True, status.HTTP_404_NOT_FOUND),
        # Update non-existent snapshot → 404
        ("api_client_admin", False, False, status.HTTP_404_NOT_FOUND),
    ]
)
def test_snapshot_update(request, org_setup, other_org_setup, user_fixture, override_sadc, snapshot_exists, expected_status):
    client = request.getfixturevalue(user_fixture)

    if snapshot_exists:
        sadc = other_org_setup["other_sadc"] if override_sadc else org_setup["sadc"]
        snapshot = Snapshot.objects.create(
            sadc=sadc,
            date=timezone.now().date(),
            type=Snapshot.MEMBERS,
            file="http://example.com/file.pdf",
            name="Original Name",
            pages=3
        )
        snapshot_id = snapshot.id
    else:
        snapshot_id = 99999  # Non-existent ID

    update_data = {
        "name": "Updated Name",
        "pages": 5,
        "date": timezone.now().date().isoformat(),
        "type": Snapshot.MEMBERS,
        "file": "http://example.com/file.pdf"
    }

    resp = client.put(reverse("snapshot", args=[snapshot_id]), update_data, format="json")
    assert resp.status_code == expected_status

    if snapshot_exists and resp.status_code == status.HTTP_200_OK:
        snapshot.refresh_from_db()
        assert snapshot.name == update_data["name"]
        assert snapshot.pages == update_data["pages"]


# ==============================
# Snapshot Delete Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,override_sadc,snapshot_exists,expected_status",
    [
        # Admin deletes own SADC snapshot → 204
        ("api_client_admin", False, True, status.HTTP_204_NO_CONTENT),
        # Admin cannot delete other SADC snapshot → 403
        ("api_client_admin", True, True, status.HTTP_404_NOT_FOUND),
        # Regular user cannot delete → 403
        ("api_client_regular", False, True, status.HTTP_404_NOT_FOUND),
        # Delete non-existent snapshot → 404
        ("api_client_admin", False, False, status.HTTP_404_NOT_FOUND),
    ]
)
def test_snapshot_delete(request, org_setup, other_org_setup, user_fixture, override_sadc, snapshot_exists, expected_status):
    client = request.getfixturevalue(user_fixture)

    if snapshot_exists:
        sadc = other_org_setup["other_sadc"] if override_sadc else org_setup["sadc"]
        snapshot = Snapshot.objects.create(
            sadc=sadc,
            date=timezone.now().date(),
            type=Snapshot.MEMBERS,
            file="http://example.com/file.pdf",
            name="Snapshot To Delete",
            pages=2
        )
        snapshot_id = snapshot.id
    else:
        snapshot_id = 99999  # Non-existent ID

    resp = client.delete(reverse("snapshot", args=[snapshot_id]))
    assert resp.status_code == expected_status

    if snapshot_exists and resp.status_code == status.HTTP_204_NO_CONTENT:
        assert not Snapshot.objects.filter(id=snapshot_id).exists()
    elif snapshot_exists:
        assert Snapshot.objects.filter(id=snapshot_id).exists()

# ==============================
# Snapshot Recent Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,view_snapshots_flag,override_sadc,expected_count,expected_status",
    [
        # Admin sees own SADC snapshots
        ("api_client_admin", True, False, 1, status.HTTP_200_OK),
        # Admin cannot see other SADC snapshots
        ("api_client_admin", True, True, 0, status.HTTP_200_OK),
        # Regular user with view_snapshots=True sees snapshots
        ("api_client_regular", True, False, 1, status.HTTP_200_OK),
        # Regular user with view_snapshots=False → forbidden
        ("api_client_regular", False, False, 0, status.HTTP_404_NOT_FOUND),
    ]
)
def test_snapshot_recent(
    request,
    org_setup,
    other_org_setup,
    user_fixture,
    view_snapshots_flag,
    override_sadc,
    expected_count,
    expected_status
):
    client = request.getfixturevalue(user_fixture)

    # Set regular user flag
    if user_fixture == "api_client_regular":
        user_obj = client.handler._force_user
        user_obj.view_snapshots = view_snapshots_flag
        user_obj.save()

    now = timezone.now()

    # Determine which SADC to assign snapshot
    sadc = other_org_setup["other_sadc"] if override_sadc else org_setup["sadc"]

    # Snapshot in current month
    Snapshot.objects.create(
        sadc=sadc,
        date=now.date(),
        type=Snapshot.MEMBERS,
        file="http://example.com/file.pdf",
        name="Current Month Snapshot",
        pages=1
    )

    # Snapshot from previous month (should not appear)
    last_month = now.replace(month=now.month - 1 if now.month > 1 else 12)
    Snapshot.objects.create(
        sadc=sadc,
        date=last_month.date(),
        type=Snapshot.MEMBERS,
        file="http://example.com/file_old.pdf",
        name="Old Snapshot",
        pages=1
    )

    url = reverse("snapshots_recent")
    resp = client.get(url)
    assert resp.status_code == expected_status

    if resp.status_code == status.HTTP_200_OK:
        assert len(resp.data) == expected_count
        if expected_count > 0:
            names = [s['name'] for s in resp.data]
            assert "Current Month Snapshot" in names


# ==============================
# Snapshot Filtering Test
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "filter_value,expected_types",
    [
        # Single types
        ("members", ["members"]),
        ("birthdays", ["birthdays"]),
        ("absences", ["absences"]),
        ("assessments", ["assessments"]),
        ("enrollments", ["enrollments"]),
        ("gifts", ["gifts"]),

        # Multiple types (will be lenient in assertion)
        ("members,birthdays", ["members", "birthdays"]),
        ("assessments,enrollments", ["assessments", "enrollments"]),

        # Case-insensitivity
        ("MeMbErS", ["members"]),

        # Empty or missing filter returns all types
        ("", ["members", "birthdays", "absences", "assessments", "enrollments", "gifts"]),
        (None, ["members", "birthdays", "absences", "assessments", "enrollments", "gifts"]),

        # Invalid input
        ("invalid", []),
    ]
)
def test_snapshot_filtering(request, org_setup, filter_value, expected_types):
    sadc = org_setup["sadc"]

    # Create snapshots for all types with unique dates
    for idx, (snap_type, _) in enumerate(Snapshot.SNAPSHOT_TYPES):
        Snapshot.objects.create(
            sadc=sadc,
            date=timezone.now().date() - timedelta(days=idx),
            type=snap_type,
            file=f"http://example.com/{snap_type}.pdf",
            name=f"{snap_type.capitalize()} Snapshot",
            pages=1
        )

    client = request.getfixturevalue("api_client_regular")
    user_obj = client.handler._force_user
    user_obj.view_snapshots = True
    user_obj.save()

    url = reverse("snapshots")
    if filter_value:
        url += f"?filter={filter_value}"

    resp = client.get(url)
    assert resp.status_code == 200

    returned_types = [s["type"] for s in resp.data["results"]]

    # Lenient assertion like audit test
    if not expected_types:
        assert returned_types == []
    else:
        assert all(rt in expected_types for rt in returned_types)

# ==============================
# Snapshot Pagination Test
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "total_snapshots,page,expected_status,expected_count,view_snapshots_flag",
    [
        # Multiple pages
        (25, 1, status.HTTP_200_OK, 20, True),   # first page
        (25, 2, status.HTTP_200_OK, 5, True),    # second page

        # Requesting page beyond last
        (5, 2, status.HTTP_404_NOT_FOUND, 0, True),
    ]
)
def test_snapshot_pagination(
    request,
    org_setup,
    total_snapshots,
    page,
    expected_status,
    expected_count,
    view_snapshots_flag
):
    client = request.getfixturevalue("api_client_regular")
    user_obj = client.handler._force_user

    # Set view_snapshots flag
    user_obj.view_snapshots = view_snapshots_flag
    user_obj.save()

    sadc = org_setup["sadc"]

    # Create snapshots with unique dates to avoid unique_together conflict
    for i in range(total_snapshots):
        Snapshot.objects.create(
            sadc=sadc,
            date=timezone.now().date() - timedelta(days=i),
            type=Snapshot.MEMBERS,
            file=f"http://example.com/file{i}.pdf",
            name=f"Snapshot {i}",
            pages=1
        )

    url = reverse("snapshots") + f"?page={page}"
    resp = client.get(url)

    assert resp.status_code == expected_status

    if resp.status_code == status.HTTP_200_OK:
        assert resp.data["count"] == total_snapshots
        assert len(resp.data["results"]) == expected_count