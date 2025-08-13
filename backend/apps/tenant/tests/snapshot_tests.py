import pytest
from django.urls import reverse
from django.utils import timezone
from backend.apps.tenant.models.snapshot_model import Snapshot

# ==============================
# Snapshot Listing Tests
# ==============================
@pytest.mark.django_db
def test_get_snapshot_list(api_client, org_setup, regular_user):
    """List snapshots and filter by type."""
    sadc = org_setup['sadc']
    Snapshot.objects.create(
        sadc=sadc,
        date=timezone.now().date(),
        type=Snapshot.MEMBERS,
        file="http://example.com/file1.pdf",
        name="Snapshot 1",
        pages=3,
    )
    Snapshot.objects.create(
        sadc=sadc,
        date=timezone.now().date(),
        type=Snapshot.BIRTHDAYS,
        file="http://example.com/file2.pdf",
        name="Snapshot 2",
        pages=2,
    )

    api_client.force_authenticate(user=regular_user)
    url = reverse("snapshots")

    resp = api_client.get(url)
    assert resp.status_code == 200
    assert resp.data['count'] == 2
    types = [item['type'] for item in resp.data['results']]
    assert Snapshot.MEMBERS in types
    assert Snapshot.BIRTHDAYS in types

    # Filter by type
    resp = api_client.get(url + "?filter=birthdays")
    assert resp.status_code == 200
    assert resp.data['count'] == 1
    assert resp.data['results'][0]['type'] == Snapshot.BIRTHDAYS

    # Filter with no match
    resp = api_client.get(url + "?filter=assessments")
    assert resp.status_code == 200
    assert resp.data['count'] == 0

@pytest.mark.django_db
def test_get_snapshot_list_empty(api_client, regular_user):
    """Return empty list if no snapshots exist."""
    api_client.force_authenticate(user=regular_user)
    url = reverse("snapshots")
    resp = api_client.get(url)
    assert resp.status_code == 200
    assert resp.data['count'] == 0

@pytest.mark.django_db
def test_snapshot_list_excludes_other_sadc(api_client, org_setup, other_org_setup, regular_user):
    """Snapshots from other SADCs are not visible."""
    Snapshot.objects.create(
        sadc=org_setup['sadc'],
        date=timezone.now().date(),
        type=Snapshot.MEMBERS,
        file="http://example.com/file1.pdf",
        name="Own SADC Snapshot",
        pages=1
    )
    Snapshot.objects.create(
        sadc=other_org_setup['other_sadc'],
        date=timezone.now().date(),
        type=Snapshot.MEMBERS,
        file="http://example.com/file2.pdf",
        name="Other SADC Snapshot",
        pages=1
    )

    api_client.force_authenticate(user=regular_user)
    url = reverse("snapshots")
    resp = api_client.get(url)
    assert resp.status_code == 200
    names = [s['name'] for s in resp.data['results']]
    assert "Own SADC Snapshot" in names
    assert "Other SADC Snapshot" not in names


# ==============================
# Snapshot Detail Tests
# ==============================

@pytest.mark.django_db
def test_get_snapshot_detail_authorized(api_client, org_setup, regular_user):
    """Authorized user can view their own SADC snapshot."""
    sadc = org_setup['sadc']
    snapshot = Snapshot.objects.create(
        sadc=sadc,
        date=timezone.now().date(),
        type=Snapshot.MEMBERS,
        file="http://example.com/file.pdf",
        name="Snapshot Detail",
        pages=1,
    )

    api_client.force_authenticate(user=regular_user)
    url = reverse("snapshot", args=[snapshot.id])
    resp = api_client.get(url)
    assert resp.status_code == 200
    assert resp.data['name'] == "Snapshot Detail"

@pytest.mark.django_db
def test_get_snapshot_detail_invalid_id(api_client, regular_user):
    """Returns 404 for invalid snapshot ID."""
    api_client.force_authenticate(user=regular_user)
    url_invalid = reverse("snapshot", args=[999])
    resp_invalid = api_client.get(url_invalid)
    assert resp_invalid.status_code == 404

@pytest.mark.django_db
def test_user_cannot_access_other_sadc_snapshot(api_client, other_org_setup, regular_user):
    """User cannot access snapshots belonging to another SADC."""
    other_snapshot = Snapshot.objects.create(
        sadc=other_org_setup['other_sadc'],
        date=timezone.now().date(),
        type=Snapshot.MEMBERS,
        file="http://example.com/file.pdf",
        name="Other SADC Snapshot",
        pages=1
    )

    api_client.force_authenticate(user=regular_user)
    url = reverse("snapshot", args=[other_snapshot.id])
    resp = api_client.get(url)
    assert resp.status_code == 403

# ==============================
# Snapshot Create Tests
# ==============================
@pytest.mark.django_db
def test_create_snapshot(api_client, org_setup, regular_user, admin_user):
    sadc = org_setup['sadc']
    new_data = {
        "date": timezone.now().date(),
        "type": Snapshot.MEMBERS,
        "file": "http://example.com/newfile.pdf",
        "name": "New Snapshot",
        "pages": 5,
    }

    # Forbidden for regular user
    api_client.force_authenticate(user=regular_user)
    resp = api_client.post(reverse("snapshots"), new_data, format="json")
    assert resp.status_code == 403
    assert resp.data["detail"] == "Admin access required."

    # Success for admin
    api_client.force_authenticate(user=admin_user)
    new_data["type"] = Snapshot.ASSESSMENTS
    resp_admin = api_client.post(reverse("snapshots"), new_data, format="json")
    assert resp_admin.status_code == 201
    assert resp_admin.data["name"] == "New Snapshot"
    assert resp_admin.data["type"] == Snapshot.ASSESSMENTS

    # Invalid data
    invalid_data = {"date": "not-a-date", "type": 123}
    resp_invalid = api_client.post(reverse("snapshots"), invalid_data, format="json")
    assert resp_invalid.status_code == 400


# ==============================
# Snapshot Update Tests
# ==============================
@pytest.mark.django_db
def test_update_snapshot(api_client, org_setup, regular_user, admin_user):
    sadc = org_setup['sadc']
    snapshot = Snapshot.objects.create(
        sadc=sadc,
        date=timezone.now().date(),
        type=Snapshot.ENROLLMENTS,
        file="http://example.com/file.pdf",
        name="Snapshot Update",
        pages=2,
    )

    update_data = {
        "name": "Updated Snapshot Name",
        "pages": 3,
        "date": snapshot.date.isoformat(),
        "type": snapshot.type,
        "file": snapshot.file,
    }

    # Forbidden for regular user
    api_client.force_authenticate(user=regular_user)
    resp_forbidden = api_client.put(reverse("snapshot", args=[snapshot.id]), update_data, format="json")
    assert resp_forbidden.status_code == 403
    assert resp_forbidden.data["detail"] == "Admin access required."

    # Success for admin
    api_client.force_authenticate(user=admin_user)
    resp_admin = api_client.put(reverse("snapshot", args=[snapshot.id]), update_data, format="json")
    assert resp_admin.status_code == 200
    assert resp_admin.data["name"] == "Updated Snapshot Name"
    assert resp_admin.data["pages"] == 3

    # Invalid ID
    resp_invalid_id = api_client.put(reverse("snapshot", args=[999]), {"name": "Fail"}, format="json")
    assert resp_invalid_id.status_code == 404

    # Invalid serializer data
    invalid_data = {"date": "invalid-date", "pages": "not-an-int"}
    resp_invalid = api_client.put(reverse("snapshot", args=[snapshot.id]), invalid_data, format="json")
    assert resp_invalid.status_code == 400


# ==============================
# Snapshot Delete Tests
# ==============================
@pytest.mark.django_db
def test_delete_snapshot(api_client, org_setup, regular_user, admin_user):
    sadc = org_setup['sadc']
    snapshot = Snapshot.objects.create(
        sadc=sadc,
        date=timezone.now().date(),
        type=Snapshot.BIRTHDAYS,
        file="http://example.com/file.pdf",
        name="Snapshot Delete",
        pages=2,
    )

    # Forbidden for regular user
    api_client.force_authenticate(user=regular_user)
    resp_forbidden = api_client.delete(reverse("snapshot", args=[snapshot.id]))
    assert resp_forbidden.status_code == 403
    assert resp_forbidden.data["detail"] == "Admin access required."

    # Success for admin
    api_client.force_authenticate(user=admin_user)
    resp_admin = api_client.delete(reverse("snapshot", args=[snapshot.id]))
    assert resp_admin.status_code == 204
    assert not Snapshot.objects.filter(id=snapshot.id).exists()

    # Invalid ID
    resp_invalid = api_client.delete(reverse("snapshot", args=[999]))
    assert resp_invalid.status_code == 404


# ==============================
# Snapshot Recent Tests
# ==============================
@pytest.mark.django_db
def test_get_recent_snapshots(api_client, org_setup, regular_user):
    """Return only snapshots in the current month."""
    sadc = org_setup['sadc']
    now = timezone.now()
    Snapshot.objects.create(
        sadc=sadc,
        date=now.date(),
        type=Snapshot.MEMBERS,
        file="http://example.com/current.pdf",
        name="Current Month",
        pages=1
    )
    Snapshot.objects.create(
        sadc=sadc,
        date=now.replace(month=now.month - 1 if now.month > 1 else 12).date(),
        type=Snapshot.MEMBERS,
        file="http://example.com/old.pdf",
        name="Old Month",
        pages=1
    )

    api_client.force_authenticate(user=regular_user)
    resp = api_client.get(reverse("snapshots_recent"))
    assert resp.status_code == 200
    assert any(s['name'] == "Current Month" for s in resp.data)
    assert all(s['name'] != "Old Month" for s in resp.data)

    # No snapshots
    Snapshot.objects.all().delete()
    resp_empty = api_client.get(reverse("snapshots_recent"))
    assert resp_empty.status_code == 200
    assert resp_empty.data == []

# ==============================
# Snapshot Field Validation Tests
# ==============================

@pytest.mark.django_db
def test_create_snapshot_invalid_type(api_client, org_setup, admin_user):
    api_client.force_authenticate(user=admin_user)
    url = reverse("snapshots")
    data = {
        "date": timezone.now().date(),
        "type": "INVALID_TYPE",
        "file": "http://example.com/file.pdf",
        "name": "Bad Type Snapshot",
        "pages": 2,
    }
    resp = api_client.post(url, data, format="json")
    assert resp.status_code == 400
    assert "type" in resp.data

@pytest.mark.django_db
def test_create_snapshot_invalid_file_url(api_client, org_setup, admin_user):
    api_client.force_authenticate(user=admin_user)
    url = reverse("snapshots")
    data = {
        "date": timezone.now().date(),
        "type": Snapshot.MEMBERS,
        "file": "not-a-url",
        "name": "Invalid File URL",
        "pages": 1,
    }
    resp = api_client.post(url, data, format="json")
    assert resp.status_code == 400
    assert "file" in resp.data