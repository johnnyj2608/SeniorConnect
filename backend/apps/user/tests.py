import pytest
from django.urls import reverse
from rest_framework import status
from backend.apps.user.models import User

# ==============================
# User Listing Tests
# ==============================

@pytest.mark.django_db
def test_get_users_list_as_admin(api_client, admin_user, org_setup):
    api_client.force_authenticate(user=admin_user)
    url = reverse('users')
    response = api_client.get(url)
    
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) >= 1
    assert any(u['email'] == admin_user.email for u in response.data)

@pytest.mark.django_db
def test_get_users_list_as_regular_user(api_client, regular_user):
    api_client.force_authenticate(user=regular_user)
    url = reverse('users')
    response = api_client.get(url)
    
    assert response.status_code == status.HTTP_200_OK
    # Only users from the same SADC should be visible
    assert all(u['email'] for u in response.data)

@pytest.mark.django_db
def test_regular_user_cannot_see_other_org_users(api_client, regular_user, other_org_setup):
    api_client.force_authenticate(user=regular_user)
    url = reverse('users')
    response = api_client.get(url)
    
    assert response.status_code == status.HTTP_200_OK
    other_sadc_user_emails = [
        u.email for u in User.objects.filter(sadc=other_org_setup['other_sadc'])
    ]
    assert all(u['email'] not in other_sadc_user_emails for u in response.data)

# ==============================
# User Detail Tests
# ==============================

@pytest.mark.django_db
def test_get_user_detail(api_client, regular_user):
    api_client.force_authenticate(user=regular_user)
    url = reverse('user', kwargs={'pk': regular_user.id})
    
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data['email'] == regular_user.email

@pytest.mark.django_db
def test_regular_user_cannot_access_other_org_user_detail(api_client, regular_user, other_org_setup):
    api_client.force_authenticate(user=regular_user)
    other_user = User.objects.create(
        email="otheruser@example.com",
        password="password",
        sadc=other_org_setup['other_sadc'],
        name="Other SADC User"
    )
    url = reverse('user', kwargs={'pk': other_user.id})
    response = api_client.get(url)
    
    assert response.status_code == status.HTTP_403_FORBIDDEN

# ==============================
# User Create Tests
# ==============================

@pytest.mark.django_db
def test_create_user_as_admin(api_client, admin_user, org_setup):
    api_client.force_authenticate(user=admin_user)
    url = reverse('users')
    
    data = {
        "email": "newuser@example.com",
        "name": "New User",
        "sadc": org_setup['sadc'].id,
        "is_org_admin": False
    }
    
    response = api_client.post(url, data, format='json')
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['email'] == "newuser@example.com"

@pytest.mark.django_db
def test_create_user_as_regular_user(api_client, regular_user, org_setup):
    api_client.force_authenticate(user=regular_user)
    url = reverse('users')
    
    data = {
        "email": "anotheruser@example.com",
        "name": "Another User",
        "sadc": org_setup['sadc'].id,
        "is_org_admin": False
    }
    
    response = api_client.post(url, data, format='json')
    assert response.status_code == status.HTTP_403_FORBIDDEN

# ==============================
# User Update Tests
# ==============================

@pytest.mark.django_db
def test_update_user(api_client, admin_user, regular_user):
    api_client.force_authenticate(user=admin_user)
    url = reverse('user', kwargs={'pk': regular_user.id})
    
    data = {"name": "Updated Name"}
    response = api_client.put(url, data, format='json')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['name'] == "Updated Name"

@pytest.mark.django_db
def test_regular_user_cannot_update_other_org_user(api_client, regular_user, other_org_setup):
    api_client.force_authenticate(user=regular_user)
    other_user = User.objects.create(
        email="otheruser2@example.com",
        password="password",
        sadc=other_org_setup['other_sadc'],
        name="Other SADC User 2"
    )
    url = reverse('user', kwargs={'pk': other_user.id})
    data = {"name": "Hacked Name"}
    response = api_client.put(url, data, format='json')
    
    assert response.status_code == status.HTTP_403_FORBIDDEN
    other_user.refresh_from_db()
    assert other_user.name != "Hacked Name"


# ==============================
# User Delete Tests
# ==============================

@pytest.mark.django_db
def test_delete_user_as_admin(api_client, admin_user, regular_user):
    api_client.force_authenticate(user=admin_user)
    url = reverse('user', kwargs={'pk': regular_user.id})
    
    response = api_client.delete(url)
    assert response.status_code == status.HTTP_204_NO_CONTENT

@pytest.mark.django_db
def test_delete_org_admin_user_fails(api_client, admin_user):
    api_client.force_authenticate(user=admin_user)
    url = reverse('user', kwargs={'pk': admin_user.id})
    
    response = api_client.delete(url)
    assert response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.django_db
def test_regular_user_cannot_delete_other_org_user(api_client, regular_user, other_org_setup):
    api_client.force_authenticate(user=regular_user)
    other_user = User.objects.create(
        email="otheruser3@example.com",
        password="password",
        sadc=other_org_setup['other_sadc'],
        name="Other SADC User 3"
    )
    url = reverse('user', kwargs={'pk': other_user.id})
    response = api_client.delete(url)
    
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert User.objects.filter(id=other_user.id).exists()

# ==============================
# User Authentication Tests
# ==============================

@pytest.mark.django_db
def test_login_logout_flow(api_client, regular_user):
    # Login
    url_login = reverse('cookie_login')
    response = api_client.post(url_login, {"email": regular_user.email, "password": "password"})
    assert response.status_code == status.HTTP_200_OK
    assert 'access' in response.cookies
    assert 'refresh' in response.cookies

    # Logout
    api_client.cookies = response.cookies
    url_logout = reverse('cookie_logout')
    response = api_client.post(url_logout)
    assert response.status_code == status.HTTP_200_OK

    # Cookies should be cleared after logout
    assert response.cookies['access'].value == ''
    assert response.cookies['refresh'].value == ''

@pytest.mark.django_db
def test_refresh_token(api_client, regular_user):
    url_login = reverse('cookie_login')
    login_resp = api_client.post(url_login, {"email": regular_user.email, "password": "password"})
    refresh_token = login_resp.cookies['refresh'].value

    api_client.cookies['refresh'] = refresh_token
    url_refresh = reverse('cookie_refresh')
    response = api_client.post(url_refresh)
    assert response.status_code == status.HTTP_200_OK
    assert 'access' in response.data