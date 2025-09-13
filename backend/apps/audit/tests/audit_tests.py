import pytest
from django.urls import reverse
from rest_framework import status
from backend.apps.audit.models.audit_model import AuditLog
from django.contrib.contenttypes.models import ContentType
from datetime import timedelta
from django.utils import timezone

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
def test_audit_list(
    request,
    admin_user,
    members_setup,
    other_org_setup,
    user_fixture,
    member_index,
    expected_in_results
):
    from backend.apps.audit.models.audit_model import AuditLog
    from django.contrib.contenttypes.models import ContentType
    from django.urls import reverse

    if member_index == "other_member":
        member = other_org_setup["other_member"]
    else:
        member = members_setup["members"][member_index]

    AuditLog.objects.create(
        user_id=admin_user.id,
        user_name=admin_user.name,
        action_type=AuditLog.CREATE,
        content_type=ContentType.objects.get_for_model(member),
        object_id=member.id,
        object_name=str(member),
        member_id=member.id,
        member_name=f"{member.last_name}, {member.first_name}",
        member_alt_name=getattr(member, "alt_name", None),
        changes=None,
    )

    client = request.getfixturevalue(user_fixture)
    url = reverse("audits")
    resp = client.get(url)
    assert resp.status_code == 200

    # Extract member_ids from response
    member_ids = [a["member_id"] for a in resp.data["results"]]

    if expected_in_results:
        assert member.id in member_ids
    else:
        assert member.id not in member_ids

# ==============================
# Audit Detail Test
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,member_index,audit_exists,expected_status",
    [
        # Admin users
        ("api_client_admin", 0, True, status.HTTP_200_OK),           # same SADC
        ("api_client_admin", "other_member", True, status.HTTP_404_NOT_FOUND),  # other SADC
        ("api_client_admin", 0, False, status.HTTP_404_NOT_FOUND),   # object does not exist

        # Regular users
        ("api_client_regular", 0, True, status.HTTP_200_OK),         # allowed MLTC
        ("api_client_regular", 1, True, status.HTTP_404_NOT_FOUND),  # denied MLTC
        ("api_client_regular", 2, True, status.HTTP_200_OK),         # no active authorization
        ("api_client_regular", 3, True, status.HTTP_200_OK),         # inactive member
    ]
)
def test_audit_detail(
    request,
    admin_user,
    members_setup,
    other_org_setup,
    user_fixture,
    member_index,
    audit_exists,
    expected_status
):
    if member_index == "other_member":
        member = other_org_setup["other_member"]
    else:
        member = members_setup["members"][member_index]

    if audit_exists:
        audit = AuditLog.objects.create(
            user_id=admin_user.id,
            user_name=admin_user.name,
            member_id=member.id,
            member_name=f"{member.last_name}, {member.first_name}",
            member_alt_name=getattr(member, "alt_name", None),
            action_type=AuditLog.CREATE,
            content_type=ContentType.objects.get_for_model(member),
            object_id=member.id,
            object_name=str(member),
        )
        audit_id = audit.id
    else:
        audit_id = 99999

    client = request.getfixturevalue(user_fixture)
    url = reverse("audit", kwargs={"pk": audit_id})
    resp = client.get(url)
    assert resp.status_code == expected_status
    if expected_status == status.HTTP_200_OK:
        assert resp.data["id"] == audit_id


# ==============================
# Audit Recent Test
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
def test_recent_audits(
    request,
    admin_user,
    members_setup,
    other_org_setup,
    user_fixture,
    member_index,
    days_ago,
    expected_visible
):
    AuditLog.objects.all().delete()
    if member_index == "other_member":
        member = other_org_setup["other_member"]
    else:
        member = members_setup["members"][member_index]

    audit = AuditLog.objects.create(
        user_id=admin_user.id,
        user_name=admin_user.name,
        member_id=member.id,
        member_name=f"{member.last_name}, {member.first_name}",
        member_alt_name=getattr(member, "alt_name", None),
        action_type=AuditLog.CREATE,
        content_type=ContentType.objects.get_for_model(member),
        object_id=member.id,
        object_name=f"audit {days_ago}",
    )

    audit.timestamp = timezone.now() - timedelta(days=days_ago)
    audit.save(update_fields=["timestamp"])

    client = request.getfixturevalue(user_fixture)
    url = reverse("audits_recent")
    resp = client.get(url)
    all_audits = [a for group in resp.data for a in group["audits"]]
    member_ids = [a["member_id"] for a in all_audits]

    if expected_visible:
        assert member.id in member_ids
    else:
        assert member.id not in member_ids


# ==============================
# Audit Filtering Test
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "filter_value,expected_types",
    [
        # Single types
        ("create", ["CREATE"]),
        ("update", ["UPDATE"]),
        ("delete", ["DELETE"]),

        # Multiple types
        ("create,update", ["CREATE", "UPDATE"]),
        ("update,delete", ["UPDATE", "DELETE"]),

        # Case-insensitivity
        ("CrEaTe", ["CREATE"]),

        # Empty or missing filter returns all types
        ("", ["CREATE", "UPDATE", "DELETE"]),
        (None, ["CREATE", "UPDATE", "DELETE"]),

        # Invalid input
        ("foobar", []),
    ]
)
def test_audit_list_filter(
    api_client_admin, 
    admin_user, 
    members_setup, 
    filter_value, 
    expected_types
):
    member = members_setup["members"][0]

    AuditLog.objects.create(
        user_id=admin_user.id,
        user_name=admin_user.name,
        member_id=member.id,
        member_name=f"{member.last_name}, {member.first_name}",
        member_alt_name=getattr(member, "alt_name", None),
        action_type=AuditLog.CREATE,
        content_type=ContentType.objects.get_for_model(member),
        object_id=member.id,
        object_name=str(member),
    )
    AuditLog.objects.create(
        user_id=admin_user.id,
        user_name=admin_user.name,
        member_id=member.id,
        member_name=f"{member.last_name}, {member.first_name}",
        member_alt_name=getattr(member, "alt_name", None),
        action_type=AuditLog.UPDATE,
        content_type=ContentType.objects.get_for_model(member),
        object_id=member.id,
        object_name=str(member),
    )
    AuditLog.objects.create(
        user_id=admin_user.id,
        user_name=admin_user.name,
        member_id=member.id,
        member_name=f"{member.last_name}, {member.first_name}",
        member_alt_name=getattr(member, "alt_name", None),
        action_type=AuditLog.DELETE,
        content_type=ContentType.objects.get_for_model(member),
        object_id=member.id,
        object_name=str(member),
    )

    base_url = reverse("audits")
    url = f"{base_url}?filter={filter_value}" if filter_value else base_url
    response = api_client_admin.get(url)
    assert response.status_code == status.HTTP_200_OK

    returned_types = [a["action_type"].upper() for a in response.data["results"]]
    if not expected_types:
        assert returned_types == []
    else:
        assert all(rt in expected_types for rt in returned_types)


# ==============================
# Audit Pagination Test
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "total_audits,page,expected_status,expected_count,next_exists",
    [
        # Multiple pages
        (25, 1, status.HTTP_200_OK, 20, True),   # first page
        (25, 2, status.HTTP_200_OK, 5, False),   # second page

        # Requesting page beyond last
        (5, 2, status.HTTP_404_NOT_FOUND, 0, False),
    ]
)
def test_audit_list_pagination(
    api_client_admin, 
    admin_user, 
    members_setup, 
    total_audits, 
    page, 
    expected_status, 
    expected_count, 
    next_exists
):
    member = members_setup["members"][0]
    AuditLog.objects.all().delete()

    for _ in range(total_audits):
        AuditLog.objects.create(
            user_id=admin_user.id,
            user_name=admin_user.name,
            member_id=member.id,
            member_name=f"{member.last_name}, {member.first_name}",
            member_alt_name=getattr(member, "alt_name", None),
            action_type=AuditLog.CREATE,
            content_type=ContentType.objects.get_for_model(member),
            object_id=member.id,
            object_name=str(member),
        )

    url = reverse("audits") + f"?page={page}"
    resp = api_client_admin.get(url)

    assert resp.status_code == expected_status
    if expected_status == status.HTTP_200_OK:
        assert len(resp.data["results"]) == expected_count
        if next_exists:
            assert resp.data["next"] is not None
        else:
            assert resp.data["next"] is None