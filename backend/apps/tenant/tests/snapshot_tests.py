import pytest
from django.urls import reverse
from backend.apps.tenant.models.snapshot_model import Snapshot
from django.utils import timezone

@pytest.mark.django_db
def test_get_snapshot_list_as_regular_user(api_client, org_setup, regular_user):
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

@pytest.mark.django_db
def test_get_snapshot_list_filter_type(api_client, org_setup, regular_user):
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
    url = reverse("snapshots") + "?filter=birthdays"

    resp = api_client.get(url)
    assert resp.status_code == 200
    assert resp.data['count'] == 1
    assert resp.data['results'][0]['type'] == Snapshot.BIRTHDAYS

@pytest.mark.django_db
def test_get_snapshot_detail_authorized(api_client, org_setup, regular_user):
    sadc = org_setup['sadc']
    snapshot = Snapshot.objects.create(
        sadc=sadc,
        date=timezone.now().date(),
        type=Snapshot.MEMBERS,
        file="http://example.com/file.pdf",
        name="Test Snapshot",
        pages=1,
    )
    api_client.force_authenticate(user=regular_user)
    url = reverse("snapshot", args=[snapshot.id])

    resp = api_client.get(url)
    assert resp.status_code == 200
    assert resp.data['name'] == "Test Snapshot"

@pytest.mark.django_db
def test_create_snapshot_forbidden_regular_user(api_client, org_setup, regular_user):
    api_client.force_authenticate(user=regular_user)
    url = reverse("snapshots")

    new_data = {
        "date": timezone.now().date(),
        "type": Snapshot.MEMBERS,
        "file": "http://example.com/newfile.pdf",
        "name": "New Snapshot",
        "pages": 5,
    }
    resp = api_client.post(url, new_data, format="json")
    assert resp.status_code == 403
    assert resp.data["detail"] == "Admin access required."

@pytest.mark.django_db
def test_create_snapshot_success_admin(api_client, org_setup, admin_user):
    api_client.force_authenticate(user=admin_user)
    url = reverse("snapshots")

    new_data = {
        "date": timezone.now().date(),
        "type": Snapshot.ASSESSMENTS,
        "file": "http://example.com/adminfile.pdf",
        "name": "Admin Snapshot",
        "pages": 4,
    }
    resp = api_client.post(url, new_data, format="json")
    assert resp.status_code == 201
    assert resp.data["name"] == "Admin Snapshot"
    assert resp.data["type"] == Snapshot.ASSESSMENTS

@pytest.mark.django_db
def test_update_snapshot_forbidden_regular_user(api_client, org_setup, regular_user):
    sadc = org_setup['sadc']
    snapshot = Snapshot.objects.create(
        sadc=sadc,
        date=timezone.now().date(),
        type=Snapshot.ENROLLMENTS,
        file="http://example.com/file.pdf",
        name="Snapshot Update",
        pages=2,
    )
    api_client.force_authenticate(user=regular_user)
    url = reverse("snapshot", args=[snapshot.id])

    update_data = {
        "name": "Hacked Name"
    }
    resp = api_client.put(url, update_data, format="json")
    assert resp.status_code == 403
    assert resp.data["detail"] == "Admin access required."

@pytest.mark.django_db
def test_update_snapshot_success_admin(api_client, org_setup, admin_user):
    sadc = org_setup['sadc']
    snapshot = Snapshot.objects.create(
        sadc=sadc,
        date=timezone.now().date(),
        type=Snapshot.ENROLLMENTS,
        file="http://example.com/file.pdf",
        name="Snapshot Update",
        pages=2,
    )
    api_client.force_authenticate(user=admin_user)
    url = reverse("snapshot", args=[snapshot.id])

    update_data = {
        "name": "Updated Snapshot Name",
        "pages": 3,
        "date": snapshot.date.isoformat(),
        "type": snapshot.type,
        "file": snapshot.file,
    }
    resp = api_client.put(url, update_data, format="json")
    assert resp.status_code == 200
    assert resp.data["name"] == "Updated Snapshot Name"
    assert resp.data["pages"] == 3

@pytest.mark.django_db
def test_delete_snapshot_forbidden_regular_user(api_client, org_setup, regular_user):
    sadc = org_setup['sadc']
    snapshot = Snapshot.objects.create(
        sadc=sadc,
        date=timezone.now().date(),
        type=Snapshot.BIRTHDAYS,
        file="http://example.com/file.pdf",
        name="Snapshot Delete",
        pages=2,
    )
    api_client.force_authenticate(user=regular_user)
    url = reverse("snapshot", args=[snapshot.id])

    resp = api_client.delete(url)
    assert resp.status_code == 403
    assert resp.data["detail"] == "Admin access required."

@pytest.mark.django_db
def test_delete_snapshot_success_admin(api_client, org_setup, admin_user):
    sadc = org_setup['sadc']
    snapshot = Snapshot.objects.create(
        sadc=sadc,
        date=timezone.now().date(),
        type=Snapshot.BIRTHDAYS,
        file="http://example.com/file.pdf",
        name="Snapshot Delete",
        pages=2,
    )
    api_client.force_authenticate(user=admin_user)
    url = reverse("snapshot", args=[snapshot.id])

    resp = api_client.delete(url)
    assert resp.status_code == 204
    assert not Snapshot.objects.filter(id=snapshot.id).exists()

@pytest.mark.django_db
def test_get_recent_snapshots(api_client, org_setup, regular_user):
    sadc = org_setup['sadc']
    now = timezone.now()
    Snapshot.objects.create(
        sadc=sadc,
        date=now.date(),
        type=Snapshot.MEMBERS,
        file="http://example.com/file1.pdf",
        name="Recent 1",
        pages=1,
    )
    Snapshot.objects.create(
        sadc=sadc,
        date=now.replace(month=now.month - 1 if now.month > 1 else 12).date(),
        type=Snapshot.MEMBERS,
        file="http://example.com/file_old.pdf",
        name="Old Snapshot",
        pages=1,
    )

    api_client.force_authenticate(user=regular_user)
    url = reverse("snapshots_recent")

    resp = api_client.get(url)
    assert resp.status_code == 200
    assert any(item['name'] == "Recent 1" for item in resp.data)
    assert all(item['name'] != "Old Snapshot" for item in resp.data)
