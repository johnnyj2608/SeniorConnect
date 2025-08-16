import pytest
from django.urls import reverse
from rest_framework import status
from backend.apps.audit.models.enrollment_model import Enrollment
from datetime import date, timedelta
from django.utils import timezone

# ==============================
# Enrollment List Tests
# ==============================

@pytest.mark.django_db
def test_get_enrollment_list(api_client_admin, members_setup):
    m1, m2, _, _, = members_setup['members']
    # Create enrollments
    Enrollment.objects.create(member=m1, change_type=Enrollment.ENROLLMENT, new_mltc=members_setup['mltc_allowed'])
    Enrollment.objects.create(member=m2, change_type=Enrollment.DISENROLLMENT, old_mltc=members_setup['mltc_denied'])
    
    url = reverse('enrollments')
    response = api_client_admin.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data['results']
    assert len(response.data['results']) == 2

# ==============================
# Enrollment Detail Tests
# ==============================

@pytest.mark.django_db
def test_get_enrollment_detail(api_client_admin, members_setup):
    m1, _, _, _ = members_setup['members']
    enrollment = Enrollment.objects.create(member=m1, change_type=Enrollment.ENROLLMENT, new_mltc=members_setup['mltc_allowed'])
    url = reverse('enrollment', kwargs={'pk': enrollment.id})
    
    response = api_client_admin.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data['member'] == m1.id

# ==============================
# Enrollment Create Tests
# ==============================

@pytest.mark.django_db
def test_create_enrollment(api_client_admin, members_setup):
    m4 = members_setup['members'][3]
    url = reverse('enrollments')
    data = {
        "member": m4.id,
        "change_type": Enrollment.ENROLLMENT,
        "new_mltc": members_setup['mltc_allowed'].name,
        "change_date": str(date.today())
    }
    response = api_client_admin.post(url, data, format='json')
    assert response.status_code == status.HTTP_400_BAD_REQUEST 

    m1 = members_setup['members'][0]
    data['member'] = m1.id
    response = api_client_admin.post(url, data, format='json')
    assert response.status_code == status.HTTP_201_CREATED
    assert Enrollment.objects.filter(member=m1).exists()

# ==============================
# Enrollment Stats Tests
# ==============================

@pytest.mark.django_db
def test_get_current_month_enrollment_stats(api_client_admin, members_setup):
    m1 = members_setup['members'][0]
    today = date.today()
    Enrollment.objects.create(member=m1, change_type=Enrollment.ENROLLMENT, new_mltc=members_setup['mltc_allowed'], change_date=today)
    url = reverse('enrollments_stats')
    
    response = api_client_admin.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert 'Overall' in response.data
    assert response.data[members_setup['mltc_allowed'].name] == 1

@pytest.mark.django_db
def test_get_recent_enrollments(api_client_admin, members_setup):
    m1 = members_setup['members'][0]
    recent_date = timezone.now() - timedelta(days=3)
    Enrollment.objects.create(member=m1, change_type=Enrollment.ENROLLMENT, new_mltc=members_setup['mltc_allowed'], change_date=recent_date)
    url = reverse('enrollments_recent')
    
    response = api_client_admin.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1

@pytest.mark.django_db
def test_current_month_stats_balances_enroll_and_disenroll(api_client_admin, members_setup):
    m1 = members_setup['members'][0]
    today = date.today()
    Enrollment.objects.create(member=m1, change_type=Enrollment.ENROLLMENT, new_mltc=members_setup['mltc_allowed'], change_date=today)
    Enrollment.objects.create(member=m1, change_type=Enrollment.DISENROLLMENT, old_mltc=members_setup['mltc_allowed'], change_date=today)

    url = reverse('enrollments_stats')
    response = api_client_admin.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert response.data[members_setup['mltc_allowed'].name] == 0  # 1 - 1 = 0

@pytest.mark.django_db
def test_recent_enrollments_excludes_old(api_client_admin, members_setup):
    m1 = members_setup['members'][0]
    old_date = timezone.now() - timedelta(days=10)
    Enrollment.objects.create(member=m1, change_type=Enrollment.ENROLLMENT, new_mltc=members_setup['mltc_allowed'], change_date=old_date)

    url = reverse('enrollments_recent')
    response = api_client_admin.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 0


# ==============================
# Enrollment Field Validation Tests
# ==============================

@pytest.mark.django_db
def test_get_enrollment_list_with_filter(api_client_admin, members_setup):
    m1, m2, _, _ = members_setup['members']
    Enrollment.objects.create(member=m1, change_type=Enrollment.ENROLLMENT, new_mltc=members_setup['mltc_allowed'])
    Enrollment.objects.create(member=m2, change_type=Enrollment.DISENROLLMENT, old_mltc=members_setup['mltc_denied'])

    url = reverse('enrollments') + "?filter=enrollment"
    response = api_client_admin.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert all(e['change_type'] == Enrollment.ENROLLMENT for e in response.data['results'])


@pytest.mark.django_db
def test_create_enrollment_invalid_mltc(api_client_admin, members_setup):
    m1 = members_setup['members'][0]
    url = reverse('enrollments')
    data = {
        "member": m1.id,
        "change_type": Enrollment.ENROLLMENT,
        "new_mltc": "does-not-exist",
        "change_date": str(date.today())
    }
    response = api_client_admin.post(url, data, format='json')
    assert response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.django_db
def test_create_enrollment_same_old_and_new_mltc_returns_200(api_client_admin, members_setup):
    m1 = members_setup['members'][0]
    mltc = members_setup['mltc_allowed']
    url = reverse('enrollments')
    data = {
        "member": m1.id,
        "change_type": Enrollment.TRANSFER,
        "old_mltc": mltc.id,
        "new_mltc": mltc.id,
        "change_date": str(date.today())
    }
    response = api_client_admin.post(url, data, format='json')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['detail'] == "Extension, no action required."

