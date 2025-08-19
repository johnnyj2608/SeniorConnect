import io
import pytest
from unittest.mock import patch
from django.urls import reverse
from datetime import date, timedelta
from rest_framework import status
from backend.apps.core.models.absence_model import Absence, Assessment

# ==============================
# Absence Listing Tests
# ==============================

@pytest.mark.django_db
def test_get_absences_list(api_client_regular, members_setup):
    member = members_setup["members"][0]
    Absence.objects.create(member=member, absence_type='vacation', start_date=date.today())

    url = reverse("absences")
    response = api_client_regular.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert response.data['results'][0]['absence_type'] == 'vacation'


@pytest.mark.django_db
def test_get_absences_list_filter_upcoming(api_client_regular, members_setup):
    member = members_setup["members"][0]
    today = date.today()
    Absence.objects.create(member=member, absence_type='vacation', start_date=today + timedelta(days=5))

    url = reverse("absences") + "?filter=upcoming"
    response = api_client_regular.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert all(absence['start_date'] > str(today) for absence in response.data['results'])


# ==============================
# Absence Detail Tests
# ==============================

@pytest.mark.django_db
def test_get_absence_detail(api_client_regular, members_setup):
    member = members_setup["members"][0]
    absence = Absence.objects.create(member=member, absence_type='personal', start_date=date.today())

    url = reverse("absence", args=[absence.id])
    response = api_client_regular.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert response.data["absence_type"] == "personal"


@pytest.mark.django_db
def test_access_denied_for_other_org_absence(api_client_regular, other_org_setup):
    other_member = other_org_setup["other_member"]
    absence = Absence.objects.create(member=other_member, absence_type='vacation', start_date=date.today())

    url = reverse("absence", args=[absence.id])
    response = api_client_regular.get(url)
    assert response.status_code == status.HTTP_403_FORBIDDEN


# ==============================
# Absence Create Tests
# ==============================

@pytest.mark.django_db
def test_create_absence(api_client_regular, members_setup):
    member = members_setup["members"][0]
    url = reverse("absences")

    payload = {
        "member": member.id,
        "absence_type": "vacation",
        "start_date": str(date.today()),
    }
    response = api_client_regular.post(url, data=payload, format="json")

    assert response.status_code == status.HTTP_201_CREATED
    assert Absence.objects.filter(member=member, absence_type="vacation").exists()


@pytest.mark.django_db
@patch("backend.apps.core.utils.absence_utils.upload_file_to_supabase")
def test_create_absence_with_file(mock_upload, api_client_regular, members_setup):
    member = members_setup["members"][0]
    mock_upload.return_value = ("https://supabase.test/file.pdf", None)
    url = reverse("absences")

    file_content = io.BytesIO(b"dummy data")
    file_content.name = "document.pdf"
    payload = {
        "member": member.id,
        "absence_type": "vacation",
        "start_date": str(date.today()),
    }

    response = api_client_regular.post(url, data={**payload, "file": file_content}, format="multipart")
    assert response.status_code == status.HTTP_201_CREATED
    absence = Absence.objects.first()
    assert "supabase.test/file.pdf" in absence.file
    mock_upload.assert_called_once()


# ==============================
# Absence Update Tests
# ==============================

@pytest.mark.django_db
def test_update_absence(api_client_regular, members_setup):
    member = members_setup["members"][0]
    absence = Absence.objects.create(member=member, absence_type="personal", start_date=date.today())
    
    url = reverse("absence", args=[absence.id])
    payload = {"member": member.id, "absence_type": "vacation", "start_date": str(date.today())}

    response = api_client_regular.put(url, data=payload, format="json")
    assert response.status_code == status.HTTP_200_OK
    absence.refresh_from_db()
    assert absence.absence_type == "vacation"


@pytest.mark.django_db
@patch("backend.apps.core.utils.absence_utils.upload_file_to_supabase")
def test_update_absence_file(mock_upload, api_client_regular, members_setup):
    member = members_setup["members"][0]
    absence = Absence.objects.create(member=member, absence_type="personal", start_date=date.today())
    mock_upload.return_value = ("https://supabase.test/newfile.pdf", None)

    url = reverse("absence", args=[absence.id])
    file_content = io.BytesIO(b"updated data")
    file_content.name = "updated.pdf"

    payload = {"member": member.id, "absence_type": "personal", "start_date": str(date.today())}
    response = api_client_regular.put(url, data={**payload, "file": file_content}, format="multipart")

    assert response.status_code == status.HTTP_200_OK
    absence.refresh_from_db()
    assert "supabase.test/newfile.pdf" in absence.file
    mock_upload.assert_called_once()


# ==============================
# Absence Delete Tests
# ==============================

@pytest.mark.django_db
def test_delete_absence(api_client_regular, members_setup):
    member = members_setup["members"][0]
    absence = Absence.objects.create(member=member, absence_type="personal", start_date=date.today())

    url = reverse("absence_delete", args=[absence.id, member.id])
    response = api_client_regular.delete(url)
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not Absence.objects.filter(id=absence.id).exists()


# ==============================
# Absences Upcoming Tests
# ==============================

@pytest.mark.django_db
def test_get_upcoming_absences(api_client_regular, members_setup):
    member = members_setup["members"][0]
    today = date.today()
    Absence.objects.create(member=member, absence_type="vacation", start_date=today + timedelta(days=3))
    Absence.objects.create(member=member, absence_type="personal", end_date=today + timedelta(days=2), start_date=today - timedelta(days=1))

    url = reverse("absences_upcoming")
    response = api_client_regular.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert "leaving" in response.data
    assert "returning" in response.data


# ==============================
# Assessment Tests
# ==============================

@pytest.mark.django_db
def test_get_assessments_list(api_client_regular, members_setup):
    member = members_setup["members"][0]
    Assessment.objects.create(member=member, absence_type="assessment", start_date=date.today())

    url = reverse("assessments")
    response = api_client_regular.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert response.data['results'][0]['absence_type'] == "assessment"


@pytest.mark.django_db
def test_get_upcoming_assessments(api_client_regular, members_setup):
    member = members_setup["members"][0]
    today = date.today()
    Assessment.objects.create(member=member, absence_type="assessment", start_date=today + timedelta(days=3))

    url = reverse("assessments_upcoming")
    response = api_client_regular.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1