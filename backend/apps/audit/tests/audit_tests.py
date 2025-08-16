import pytest
from django.urls import reverse
from rest_framework import status
from backend.apps.audit.models.audit_model import AuditLog
from django.contrib.contenttypes.models import ContentType

# ==============================
# Audit List Tests
# ==============================

@pytest.mark.django_db
def test_get_audit_list_admin(api_client_admin, admin_user, members_setup):
    """Admin sees all audits."""
    member = members_setup['members'][0]

    AuditLog.objects.create(
        user=admin_user,
        action_type=AuditLog.CREATE,
        content_type=ContentType.objects.get_for_model(admin_user),
        object_id=admin_user.id,
        member=member,
        object_display=str(admin_user)
    )

    url = reverse('audits')

    api_client_admin.force_authenticate(user=admin_user)
    response = api_client_admin.get(url)
    assert response.status_code == status.HTTP_200_OK
    audit_ids = [a['id'] for a in response.data['results']]
    assert len(audit_ids) >= 1

@pytest.mark.django_db
def test_get_audit_list_regular(api_client_regular, regular_user, members_setup, admin_user):
    """Regular user sees only allowed members' audits."""
    member = members_setup['members'][0]

    # Create audits by admin for testing
    AuditLog.objects.create(
        user=admin_user,
        action_type=AuditLog.CREATE,
        content_type=ContentType.objects.get_for_model(admin_user),
        object_id=admin_user.id,
        member=member,
        object_display=str(admin_user)
    )

    url = reverse('audits')

    api_client_regular.force_authenticate(user=regular_user)
    response = api_client_regular.get(url)
    assert response.status_code == status.HTTP_200_OK

    allowed_member_ids = [
        m.id for m in members_setup['members']
        if (m.active_auth is None) or (m.active_auth.mltc in regular_user.allowed_mltcs.all())
    ]
    member_ids_in_response = [
        a['member'] if isinstance(a['member'], int) else a['member']['id']
        for a in response.data['results']
    ]
    assert all(mid in allowed_member_ids for mid in member_ids_in_response)

@pytest.mark.django_db
def test_regular_user_cannot_see_denied_mltc(api_client_regular, regular_user, members_setup, admin_user):
    """Regular user cannot see audits for denied MLTC members."""
    allowed_member = members_setup['members'][0]
    denied_member = members_setup['members'][1]

    AuditLog.objects.create(
        user=admin_user,
        action_type=AuditLog.CREATE,
        content_type=ContentType.objects.get_for_model(admin_user),
        object_id=admin_user.id,
        member=allowed_member,
        object_display=str(admin_user)
    )
    AuditLog.objects.create(
        user=admin_user,
        action_type=AuditLog.CREATE,
        content_type=ContentType.objects.get_for_model(admin_user),
        object_id=admin_user.id,
        member=denied_member,
        object_display=str(admin_user)
    )

    url = reverse('audits')
    api_client_regular.force_authenticate(user=regular_user)
    response = api_client_regular.get(url)
    assert response.status_code == status.HTTP_200_OK

    member_ids_in_response = [
        a['member'] if isinstance(a['member'], int) else a['member']['id']
        for a in response.data['results']
    ]
    assert denied_member.id not in member_ids_in_response
    assert allowed_member.id in member_ids_in_response


# ==============================
# Audit Detail Test
# ==============================

@pytest.mark.django_db
def test_get_audit_detail(api_client_admin, admin_user, members_setup):
    """Admin can get audit detail if member is accessible."""
    member = members_setup['members'][0]
    audit = AuditLog.objects.create(
        user=admin_user,
        action_type=AuditLog.CREATE,
        content_type=ContentType.objects.get_for_model(admin_user),
        object_id=admin_user.id,
        member=member,
        object_display=str(admin_user)
    )

    api_client_admin.force_authenticate(user=admin_user)
    url = reverse('audit', kwargs={'pk': str(audit.id)})
    response = api_client_admin.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data['id'] == audit.id

# ==============================
# Recent Audits Test
# ==============================

@pytest.mark.django_db
def test_get_recent_audits(api_client_admin, api_client_regular, admin_user, regular_user, members_setup):
    """Test that recent audits endpoint returns audits grouped by date and filtered by member access."""
    member1 = members_setup['members'][0]
    member2 = members_setup['members'][1]

    # Create audits for today
    audit1 = AuditLog.objects.create(
        user=admin_user,
        action_type=AuditLog.CREATE,
        content_type=ContentType.objects.get_for_model(member1),
        object_id=member1.id,
        member=member1,
        object_display=str(member1)
    )
    audit2 = AuditLog.objects.create(
        user=admin_user,
        action_type=AuditLog.UPDATE,
        content_type=ContentType.objects.get_for_model(member2),
        object_id=member2.id,
        member=member2,
        object_display=str(member2)
    )

    url = reverse('audits_recent')

    # Admin sees both audits
    api_client_admin.force_authenticate(user=admin_user)
    response = api_client_admin.get(url)
    assert response.status_code == status.HTTP_200_OK
    all_audits = [a for group in response.data for a in group['audits']]
    audit_ids = [a['id'] for a in all_audits]
    assert audit1.id in audit_ids
    assert audit2.id in audit_ids

    # Regular user sees only allowed member audits
    api_client_regular.force_authenticate(user=regular_user)
    response = api_client_regular.get(url)
    member_ids_in_response = [
        a['member'] if isinstance(a['member'], int) else a['member']['id']
        for group in response.data for a in group['audits']
    ]
    allowed_member_ids = [
        m.id for m in members_setup['members']
        if (m.active_auth is None) or (m.active_auth.mltc in regular_user.allowed_mltcs.all())
    ]
    assert all(mid in allowed_member_ids for mid in member_ids_in_response)


# ==============================
# Audit List Filtering Test
# ==============================

@pytest.mark.django_db
def test_audit_list_filter(api_client_admin, admin_user, members_setup):
    """Test filtering audits by action_type."""
    member = members_setup['members'][0]

    AuditLog.objects.create(
        user=admin_user,
        action_type=AuditLog.CREATE,
        content_type=ContentType.objects.get_for_model(member),
        object_id=member.id,
        member=member,
        object_display=str(member)
    )
    AuditLog.objects.create(
        user=admin_user,
        action_type=AuditLog.UPDATE,
        content_type=ContentType.objects.get_for_model(member),
        object_id=member.id,
        member=member,
        object_display=str(member)
    )

    url = reverse('audits') + "?filter=create"
    api_client_admin.force_authenticate(user=admin_user)
    response = api_client_admin.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert all(a['action_type'].lower() == 'create' for a in response.data['results'])
