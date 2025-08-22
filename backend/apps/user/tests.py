import pytest
from django.urls import reverse
from rest_framework import status
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from backend.apps.user.models import User
from unittest.mock import patch

# ==============================
# User List Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,org_setup_fixture,expected_status,can_see_users,sadc_key",
    [
        # Admin same SADC → success
        ("api_client_admin", "org_setup", status.HTTP_200_OK, True, "sadc"),

        # Admin other SADC → fail (cannot see users from that SADC)
        ("api_client_admin", "other_org_setup", status.HTTP_200_OK, False, "other_sadc"),

        # Regular user → fail (cannot see users even in same SADC)
        ("api_client_regular", "org_setup", status.HTTP_200_OK, True, "sadc"),
    ]
)
def test_user_list(
    request, 
    user_fixture, 
    org_setup_fixture, 
    expected_status, 
    can_see_users, 
    sadc_key
):
    client = request.getfixturevalue(user_fixture)
    org_data = request.getfixturevalue(org_setup_fixture)
    sadc = org_data[sadc_key]

    url = reverse("users")
    response = client.get(url)
    assert response.status_code == expected_status

    returned_emails = [u['email'] for u in response.data]

    if can_see_users:
        # Should include at least one user in the SADC
        assert any(u.email in returned_emails for u in User.objects.filter(sadc=sadc))
    else:
        # Should not include any users in the SADC
        assert all(u.email not in returned_emails for u in User.objects.filter(sadc=sadc))

# ==============================
# User Detail Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,target_user_fixture,user_exists,expected_status",
    [
        # Admin same SADC → success
        ("api_client_admin", "regular_user", True, status.HTTP_200_OK),

        # Admin other SADC → forbidden
        ("api_client_admin", "other_org_user", True, status.HTTP_403_FORBIDDEN),

        # Regular user fetching self → allowed
        ("api_client_regular", "regular_user", True, status.HTTP_200_OK),

        # Regular user fetching other user → forbidden
        ("api_client_regular", "admin_user", True, status.HTTP_403_FORBIDDEN),

        # Fetch non-existent user → 404
        ("api_client_admin", "nonexistent_user", False, status.HTTP_404_NOT_FOUND),
    ]
)
def test_user_detail(
    request, 
    user_fixture, 
    target_user_fixture, 
    user_exists,
    expected_status, 
    other_org_setup, 
    admin_user, 
    regular_user
):
    client = request.getfixturevalue(user_fixture)

    if user_exists:
        # Determine which target user to use
        if target_user_fixture == "other_org_user":
            target_user = User.objects.create(
                email="otheruser@example.com",
                password="password",
                sadc=other_org_setup['other_sadc'],
                name="Other SADC User"
            )
        elif target_user_fixture == "regular_user":
            target_user = regular_user
        elif target_user_fixture == "admin_user":
            target_user = admin_user
        else:
            raise ValueError("Unknown target_user_fixture")
        user_id = target_user.id
    else:
        # Non-existent user
        user_id = 9999

    url = reverse("user", kwargs={"pk": user_id})
    response = client.get(url)
    assert response.status_code == expected_status

    if expected_status == status.HTTP_200_OK:
        assert response.data["email"] == target_user.email

# ==============================
# User Create Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,email,name,sadc_fixture,is_org_admin,expected_status",
    [
        # 1. Admin creates regular user in same SADC → success
        ("api_client_admin", "newuser@example.com", "New User", "org_setup", False, status.HTTP_201_CREATED),

        # 2. Admin tries to create an admin user in same SADC → fail
        ("api_client_admin", "newadmin@example.com", "New Admin", "org_setup", True, status.HTTP_400_BAD_REQUEST),

        # 3. Admin tries to create user in another SADC → fail
        ("api_client_admin", "otheruser@example.com", "Other User", "other_org_setup", False, status.HTTP_403_FORBIDDEN),

        # 4. Regular user tries to create any user → fail
        ("api_client_regular", "regularcreate@example.com", "Regular Create", "org_setup", False, status.HTTP_403_FORBIDDEN),

        # 5. Missing email → fail
        ("api_client_admin", "", "No Email", "org_setup", False, status.HTTP_400_BAD_REQUEST),

        # 6. Duplicate email → fail
        ("api_client_admin", "user@example.com", "Duplicate User", "org_setup", False, status.HTTP_400_BAD_REQUEST),
    ]
)
def test_user_create(
    request,
    user_fixture,
    email,
    name,
    sadc_fixture,
    is_org_admin,
    expected_status,
    org_setup,
    other_org_setup,
    regular_user
):
    client = request.getfixturevalue(user_fixture)
    
    # Pick correct fixture dict
    org_data = request.getfixturevalue(sadc_fixture)
    if 'sadc' in org_data:
        sadc_obj = org_data['sadc']
    elif 'other_sadc' in org_data:
        sadc_obj = org_data['other_sadc']
    else:
        raise ValueError(f"No SADC found in {sadc_fixture}")

    url = reverse("users")
    data = {"email": email, "name": name, "sadc": sadc_obj.id, "is_org_admin": is_org_admin}
    response = client.post(url, data, format="json")

    assert response.status_code == expected_status
    if expected_status == status.HTTP_201_CREATED:
        assert response.data["email"] == email


# ==============================
# User Update Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,email,name,sadc_fixture,is_org_admin,extra_fields,expected_status,user_exists",
    [
        # 1. Admin updates regular user in same SADC → success
        ("api_client_admin", "regular_user@example.com", "Updated Name", "org_setup", False, {}, status.HTTP_200_OK, True),

        # 2. Admin tries to update user to admin in same SADC → success
        ("api_client_admin", "regular_user@example.com", "New Admin Name", "org_setup", True, {}, status.HTTP_200_OK, True),

        # 3. Admin tries to update user in another SADC → fail
        ("api_client_admin", "otheruser@example.com", "Hacked Name", "other_org_setup", False, {}, status.HTTP_403_FORBIDDEN, True),

        # 4. Regular user tries to update any user → fail
        ("api_client_regular", "regular_user@example.com", "Hacked Name", "org_setup", False, {}, status.HTTP_403_FORBIDDEN, True),

        # 5. Admin tries to update sadc field → silently ignored (200 but unchanged)
        ("api_client_admin", "regular_user@example.com", "Keep Name", "org_setup", False, {"sadc": 999}, status.HTTP_200_OK, True),

        # 6. Update non-existent user → 404
        ("api_client_admin", "nonexistent@example.com", "Ghost Name", "org_setup", False, {}, status.HTTP_404_NOT_FOUND, False),
    ]
)
def test_user_update(
    request, 
    user_fixture, 
    email, 
    name, 
    sadc_fixture, 
    is_org_admin, 
    extra_fields,
    expected_status, 
    user_exists,
    regular_user, 
    org_setup, 
    other_org_setup
):
    client = request.getfixturevalue(user_fixture)

    # Pick the target user based on existence
    if user_exists:
        if email.startswith("otheruser"):
            target_user = User.objects.create(
                email=email,
                password="password",
                sadc=other_org_setup['other_sadc'],
                name="Other SADC User"
            )
        else:
            target_user = regular_user
        user_id = target_user.id
    else:
        # Non-existent user ID
        user_id = 9999

    url = reverse('user', kwargs={'pk': user_id})
    payload = {"name": name, **extra_fields}
    if is_org_admin:
        payload["is_org_admin"] = True

    response = client.put(url, payload, format='json')
    assert response.status_code == expected_status

    if user_exists and expected_status == 200:
        target_user.refresh_from_db()
        if "sadc" in extra_fields:
            # sadc update should be silently ignored
            assert target_user.sadc == org_setup["sadc"]
        elif is_org_admin:
            # is_org_admin cannot be changed through API
            assert target_user.is_org_admin is False
        else:
            assert target_user.name == name
    elif user_exists:
        target_user.refresh_from_db()
        assert target_user.name != name

# ==============================
# User Patch Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,email,patch_field,patch_value,sadc_fixture,expected_status,user_exists",
    [
        # 1. Admin patches regular user in same SADC → success
        ("api_client_admin", "regular_user@example.com", "name", "New Name", "org_setup", status.HTTP_200_OK, True),

        # 2. Admin tries to patch is_org_admin → ignore field, still 200
        ("api_client_admin", "regular_user@example.com", "is_org_admin", True, "org_setup", status.HTTP_200_OK, True),

        # 3. Admin tries to patch user in another SADC → fail
        ("api_client_admin", "otheruser@example.com", "name", "Hacked Name", "other_org_setup", status.HTTP_403_FORBIDDEN, True),

        # 4. Regular user patches self → success
        ("api_client_regular", "regular_user@example.com", "name", "My New Name", "org_setup", status.HTTP_200_OK, True),

        # 5. Regular user tries to patch another user → fail
        ("api_client_regular", "admin_user@example.com", "name", "Hacked Name", "org_setup", status.HTTP_403_FORBIDDEN, True),

        # 6. Admin tries to patch sadc → silently ignored (200 but unchanged)
        ("api_client_admin", "regular_user@example.com", "sadc", 999, "org_setup", status.HTTP_200_OK, True),

        # 7. Patch non-existent user → 404
        ("api_client_admin", "nonexistent@example.com", "name", "Ghost Name", "org_setup", status.HTTP_404_NOT_FOUND, False),
    ]
)
def test_user_patch(
    request,
    user_fixture,
    email,
    patch_field,
    patch_value,
    sadc_fixture,
    expected_status,
    user_exists,
    regular_user,
    admin_user,
    other_org_setup,
    org_setup
):
    client = request.getfixturevalue(user_fixture)

    # Pick the target user
    if user_exists:
        if email.startswith("otheruser"):
            target_user = User.objects.create(
                email=email,
                password="password",
                sadc=other_org_setup['other_sadc'],
                name="Other SADC User"
            )
        elif email == "admin_user@example.com":
            target_user = admin_user
        else:
            target_user = regular_user
        user_id = target_user.id
    else:
        # Non-existent user ID
        user_id = 9999

    url = reverse("user", kwargs={"pk": user_id})
    payload = {patch_field: patch_value}
    response = client.patch(url, payload, format="json")

    assert response.status_code == expected_status

    if user_exists and expected_status == status.HTTP_200_OK:
        target_user.refresh_from_db()
        if patch_field == "is_org_admin":
            # Should not change
            assert target_user.is_org_admin is False
        elif patch_field == "sadc":
            # Silently ignored, should stay the same
            assert target_user.sadc == org_setup["sadc"]
        else:
            assert getattr(target_user, patch_field) == patch_value
    elif user_exists:
        # Ensure nothing changed for forbidden patches
        if patch_field not in ["is_org_admin", "sadc"]:
            target_user.refresh_from_db()
            assert getattr(target_user, patch_field) != patch_value

# ==============================
# User Delete Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "user_fixture,target_user_factory,user_exists,expected_status",
    [
        # 1. Admin deletes regular user in same SADC → success
        ("api_client_admin", "regular_user", True, status.HTTP_204_NO_CONTENT),

        # 2. Admin tries to delete another admin in same SADC → fail
        ("api_client_admin", "admin_user", True, status.HTTP_403_FORBIDDEN),

        # 3. Admin tries to delete user in another SADC → fail
        ("api_client_admin", "other_org_user", True, status.HTTP_403_FORBIDDEN),

        # 4. Admin tries to delete self → fail
        ("api_client_admin", "admin_user", True, status.HTTP_403_FORBIDDEN),

        # 5. Regular user tries to delete any user → fail
        ("api_client_regular", "regular_user", True, status.HTTP_403_FORBIDDEN),

        # 6. Delete non-existent user → 404
        ("api_client_admin", "nonexistent_user", False, status.HTTP_404_NOT_FOUND),
    ]
)
def test_user_delete(
    request, 
    user_fixture, 
    target_user_factory,
    user_exists,
    expected_status,           
    regular_user, 
    admin_user, 
    other_org_setup
):
    client = request.getfixturevalue(user_fixture)

    # Pick the target user
    if user_exists:
        if target_user_factory == "other_org_user":
            target_user = User.objects.create(
                email="otheruser3@example.com",
                password="password",
                sadc=other_org_setup['other_sadc'],
                name="Other SADC User 3"
            )
        elif target_user_factory == "admin_user":
            target_user = admin_user
        else:
            target_user = regular_user
        user_id = target_user.id
    else:
        # Non-existent user ID
        user_id = 9999

    url = reverse('user', kwargs={'pk': user_id})
    response = client.delete(url)

    assert response.status_code == expected_status

    if user_exists and expected_status == status.HTTP_204_NO_CONTENT:
        assert not User.objects.filter(id=user_id).exists()
    elif user_exists:
        assert User.objects.filter(id=user_id).exists()

# ==============================
# Password Reset Tests
# ==============================

@pytest.mark.django_db
@pytest.mark.parametrize(
    "email_input,expected_status,check_detail",
    [
        ({}, status.HTTP_400_BAD_REQUEST, "Email is required."),
        ({"email": "doesnotexist@example.com"}, status.HTTP_200_OK, "reset link has been sent"),
    ]
)
def test_reset_password_requires_email_or_nonexistent(api_client_regular, email_input, expected_status, check_detail):
    url = reverse("password_reset")
    response = api_client_regular.post(url, email_input, format="json")
    assert response.status_code == expected_status
    assert check_detail in response.data["detail"]


@pytest.mark.django_db
@patch("backend.apps.user.utils.sendEmailInvitation")
def test_reset_password_existing_email_sends_link(mock_send_email, api_client_regular, regular_user):
    url = reverse("password_reset")
    response = api_client_regular.post(url, {"email": regular_user.email}, format="json")
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
@pytest.mark.parametrize(
    "uid_token_factory,password_input,expected_status,expected_message",
    [
        ("invalid_uid", "NewPass123!", status.HTTP_400_BAD_REQUEST, "Invalid link"),
        ("invalid_token", "NewPass123!", status.HTTP_400_BAD_REQUEST, "Token expired or invalid"),
    ]
)
def test_set_password_invalid_cases(api_client_regular, uid_token_factory, password_input, expected_status, expected_message, regular_user):
    if uid_token_factory == "invalid_uid":
        uidb64 = "invalid"
        token = "abc"
    else:
        uidb64 = urlsafe_base64_encode(force_bytes(regular_user.pk))
        token = "invalid-token"

    url = reverse("password_set", kwargs={"uidb64": uidb64, "token": token})
    response = api_client_regular.post(url, {"password": password_input}, format="json")
    assert response.status_code == expected_status
    assert expected_message in response.data["detail"]


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


# ==============================
# Login Tests
# ==============================
@pytest.mark.django_db
@pytest.mark.parametrize(
    "email,password,expected_status,expected_detail",
    [
        ("user@example.com", "password", status.HTTP_200_OK, "Logged in successfully"),
        ("user@example.com", "wrongpassword", status.HTTP_401_UNAUTHORIZED, "Invalid credentials"),
        ("nonexistent@example.com", "any", status.HTTP_401_UNAUTHORIZED, "Invalid credentials"),
    ]
)
def test_login(api_client_regular, email, password, expected_status, expected_detail):
    url = reverse("cookie_login")
    response = api_client_regular.post(url, {"email": email, "password": password}, format="json")

    assert response.status_code == expected_status
    if expected_status == status.HTTP_200_OK:
        assert "user" in response.data
        assert "message" in response.data and expected_detail in response.data["message"]
        # Access and refresh cookies should be set
        assert "access" in response.cookies
        assert "refresh" in response.cookies
    else:
        assert "detail" in response.data and expected_detail in response.data["detail"]


# ================================================
# Logout Test
# ================================================
@pytest.mark.django_db
def test_logout(api_client_regular):
    # First login to set cookies
    login_url = reverse("cookie_login")
    api_client_regular.post(login_url, {"email": "user@example.com", "password": "password"}, format="json")

    logout_url = reverse("cookie_logout")
    response = api_client_regular.post(logout_url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data["message"] == "Logged out successfully"

    # Check that cookies were cleared (max-age 0 or empty value)
    access_cookie = response.cookies.get("access")
    refresh_cookie = response.cookies.get("refresh")
    assert access_cookie is not None and access_cookie.value == ""
    assert refresh_cookie is not None and refresh_cookie.value == ""


# ================================================
# JWT Refresh Tests
# ================================================
@pytest.mark.django_db
def test_jwt_refresh(api_client_regular):
    login_url = reverse("cookie_login")
    login_resp = api_client_regular.post(login_url, {"email": "user@example.com", "password": "password"}, format="json")
    refresh_cookie = login_resp.cookies.get("refresh").value

    refresh_url = reverse("cookie_refresh")
    api_client_regular.cookies["refresh"] = refresh_cookie
    refresh_resp = api_client_regular.post(refresh_url)
    assert refresh_resp.status_code == status.HTTP_200_OK
    assert "access" in refresh_resp.data
    assert "access" in refresh_resp.cookies


@pytest.mark.django_db
def test_jwt_refresh_missing_token(api_client_regular):
    refresh_url = reverse("cookie_refresh")
    response = api_client_regular.post(refresh_url)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Refresh token missing" in response.data["detail"]


@pytest.mark.django_db
def test_jwt_refresh_invalid_token(api_client_regular):
    refresh_url = reverse("cookie_refresh")
    api_client_regular.cookies["refresh"] = "invalidtoken"
    response = api_client_regular.post(refresh_url)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Invalid refresh token" in response.data["detail"]