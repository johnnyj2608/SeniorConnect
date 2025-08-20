import pytest
from django.urls import reverse
from rest_framework import status
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from backend.apps.user.models import User
from unittest.mock import patch

# ==============================
# User Listing Tests
# ==============================

@pytest.mark.django_db
def test_get_users_list_as_admin(api_client_admin, admin_user):
    url = reverse('users')
    response = api_client_admin.get(url)
    
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) >= 1
    assert any(u['email'] == admin_user.email for u in response.data)

@pytest.mark.django_db
def test_get_users_list_as_regular_user(api_client_regular):
    url = reverse('users')
    response = api_client_regular.get(url)
    
    assert response.status_code == status.HTTP_200_OK
    assert all(u['email'] for u in response.data)

@pytest.mark.django_db
def test_regular_user_cannot_see_other_org_users(api_client_regular, other_org_setup):
    url = reverse('users')
    response = api_client_regular.get(url)
    
    assert response.status_code == status.HTTP_200_OK
    other_sadc_user_emails = [
        u.email for u in User.objects.filter(sadc=other_org_setup['other_sadc'])
    ]
    assert all(u['email'] not in other_sadc_user_emails for u in response.data)

# ==============================
# User Detail Tests
# ==============================

@pytest.mark.django_db
def test_get_user_detail(api_client_regular, regular_user):
    url = reverse('user', kwargs={'pk': regular_user.id})
    response = api_client_regular.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data['email'] == regular_user.email

@pytest.mark.django_db
def test_regular_user_cannot_access_other_org_user_detail(api_client_regular, regular_user, other_org_setup):
    other_user = User.objects.create(
        email="otheruser@example.com",
        password="password",
        sadc=other_org_setup['other_sadc'],
        name="Other SADC User"
    )
    url = reverse('user', kwargs={'pk': other_user.id})
    response = api_client_regular.get(url)
    assert response.status_code == status.HTTP_403_FORBIDDEN

# ==============================
# User Create Tests
# ==============================

@pytest.mark.django_db
def test_create_user_as_admin(api_client_admin, org_setup):
    url = reverse('users')
    data = {
        "email": "newuser@example.com",
        "name": "New User",
        "sadc": org_setup['sadc'].id,
        "is_org_admin": False
    }
    response = api_client_admin.post(url, data, format='json')
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['email'] == "newuser@example.com"

@pytest.mark.django_db
def test_create_user_as_regular_user(api_client_regular, org_setup):
    url = reverse('users')
    data = {
        "email": "anotheruser@example.com",
        "name": "Another User",
        "sadc": org_setup['sadc'].id,
        "is_org_admin": False
    }
    response = api_client_regular.post(url, data, format='json')
    assert response.status_code == status.HTTP_403_FORBIDDEN

# ==============================
# User Update Tests
# ==============================

@pytest.mark.django_db
def test_update_user(api_client_admin, regular_user):
    url = reverse('user', kwargs={'pk': regular_user.id})
    data = {"name": "Updated Name"}
    response = api_client_admin.put(url, data, format='json')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['name'] == "Updated Name"

@pytest.mark.django_db
def test_regular_user_cannot_update_other_org_user(api_client_regular, other_org_setup):
    other_user = User.objects.create(
        email="otheruser2@example.com",
        password="password",
        sadc=other_org_setup['other_sadc'],
        name="Other SADC User 2"
    )
    url = reverse('user', kwargs={'pk': other_user.id})
    data = {"name": "Hacked Name"}
    response = api_client_regular.put(url, data, format='json')
    assert response.status_code == status.HTTP_403_FORBIDDEN
    other_user.refresh_from_db()
    assert other_user.name != "Hacked Name"

# ==============================
# User Delete Tests
# ==============================

@pytest.mark.django_db
def test_delete_user_as_admin(api_client_admin, regular_user):
    url = reverse('user', kwargs={'pk': regular_user.id})
    response = api_client_admin.delete(url)
    assert response.status_code == status.HTTP_204_NO_CONTENT

@pytest.mark.django_db
def test_delete_org_admin_user_fails(api_client_admin, admin_user):
    url = reverse('user', kwargs={'pk': admin_user.id})
    response = api_client_admin.delete(url)
    assert response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.django_db
def test_regular_user_cannot_delete_other_org_user(api_client_regular, other_org_setup):
    other_user = User.objects.create(
        email="otheruser3@example.com",
        password="password",
        sadc=other_org_setup['other_sadc'],
        name="Other SADC User 3"
    )
    url = reverse('user', kwargs={'pk': other_user.id})
    response = api_client_regular.delete(url)
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert User.objects.filter(id=other_user.id).exists()

# ==============================
# Password Reset Tests
# ==============================

@pytest.mark.django_db
def test_reset_password_requires_email(api_client_regular):
    url = reverse("password_reset")
    response = api_client_regular.post(url, {}, format="json")
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Email is required." in response.data["detail"]


@pytest.mark.django_db
def test_reset_password_nonexistent_email_returns_200(api_client_regular):
    url = reverse("password_reset")
    response = api_client_regular.post(
        url, {"email": "doesnotexist@example.com"}, format="json"
    )

    assert response.status_code == status.HTTP_200_OK
    assert "reset link has been sent" in response.data["detail"]


@pytest.mark.django_db
@patch("backend.apps.user.utils.sendEmailInvitation")
def test_reset_password_existing_email_sends_link(mock_send_email, api_client_regular, regular_user):
    url = reverse("password_reset")

    response = api_client_regular.post(
        url, {"email": regular_user.email}, format="json"
    )

    assert response.status_code == status.HTTP_200_OK
    assert "reset link has been sent" in response.data["detail"]

    mock_send_email.assert_called_once()
    called_user, called_request = mock_send_email.call_args[0]
    assert called_user == regular_user
    assert hasattr(called_request, "data")

# ==============================
# Password Set Tests
# ==============================

@pytest.mark.django_db
def test_set_password_invalid_uid_returns_400(api_client_regular):
    url = reverse("password_set", kwargs={"uidb64": "invalid", "token": "abc"})
    response = api_client_regular.post(url, {"password": "NewPass123!"}, format="json")
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Invalid link" in response.data["detail"]


@pytest.mark.django_db
def test_set_password_invalid_token_returns_400(api_client_regular, regular_user):
    uidb64 = urlsafe_base64_encode(force_bytes(regular_user.pk))
    url = reverse("password_set", kwargs={"uidb64": uidb64, "token": "invalid-token"})

    response = api_client_regular.post(url, {"password": "NewPass123!"}, format="json")
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Token expired or invalid" in response.data["detail"]


@pytest.mark.django_db
def test_set_password_valid_token_changes_password(api_client_regular, regular_user):
    uidb64 = urlsafe_base64_encode(force_bytes(regular_user.pk))
    token = default_token_generator.make_token(regular_user)
    url = reverse("password_set", kwargs={"uidb64": uidb64, "token": token})

    response = api_client_regular.post(url, {"password": "NewStrongPass123!"}, format="json")

    assert response.status_code == status.HTTP_200_OK
    assert "Password set successfully" in response.data["message"]

    regular_user.refresh_from_db()
    assert regular_user.check_password("NewStrongPass123!")