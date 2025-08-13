import pytest
from django.urls import reverse
from backend.apps.tenant.models.gift_model import Gift

# ==============================
# Gift Listing Tests
# ==============================

@pytest.mark.django_db
def test_get_gift_list(api_client, org_setup, regular_user):
    """
    Any user should get the list of gifts belonging to their Sadc.
    """
    sadc = org_setup['sadc']
    mltc_allowed = org_setup['mltc_allowed']

    # Create gifts
    gift1 = Gift.objects.create(name="Gift 1", sadc=sadc, mltc=mltc_allowed)
    gift2 = Gift.objects.create(name="Gift 2", sadc=sadc, mltc=None)
    gift3 = Gift.objects.create(name="Gift 3", sadc=sadc, birth_month=5)

    api_client.force_authenticate(user=regular_user)
    url = reverse("gifts")
    resp = api_client.get(url)

    assert resp.status_code == 200
    data = resp.json()

    # Check gift names exist in response
    assert any(g["name"] == gift1.name for g in data)
    assert any(g["name"] == gift2.name for g in data)
    assert any(g["name"] == gift3.name for g in data)

    # Check individual fields
    gift1_data = next(g for g in data if g["name"] == gift1.name)
    assert gift1_data.get("mltc") == mltc_allowed.name
    gift2_data = next(g for g in data if g["name"] == gift2.name)
    assert gift2_data.get("mltc") is None
    gift3_data = next(g for g in data if g["name"] == gift3.name)
    assert gift3_data.get("birth_month") == 5

# ==============================
# Gift Detail Tests
# ==============================

@pytest.mark.django_db
def test_get_gift_detail_unauthorized(api_client, regular_user, other_org_setup):
    """
    Regular user cannot access a gift from another SADC.
    """
    other_sadc = other_org_setup['other_sadc']
    gift = Gift.objects.create(name="Other SADC Gift", sadc=other_sadc)

    api_client.force_authenticate(user=regular_user)
    url = reverse("gift", args=[gift.id])
    resp = api_client.get(url)

    assert resp.status_code == 403

# ==============================
# Gift Creation Tests
# ==============================

@pytest.mark.django_db
def test_create_gift_success_for_regular_user(api_client, org_setup, regular_user):
    """
    Regular user can create a gift.
    """
    api_client.force_authenticate(user=regular_user)
    url = reverse("gifts")

    new_data = {
        "name": "New Gift",
        "mltc": org_setup['mltc_allowed'].name,
        "birth_month": 5,
    }

    resp = api_client.post(url, new_data, format="json")
    assert resp.status_code == 201
    assert resp.data["name"] == "New Gift"
    assert resp.data.get("birth_month") == 5
    assert resp.data["mltc"] == org_setup['mltc_allowed'].name

@pytest.mark.django_db
def test_create_gift_success_for_admin(api_client, org_setup, admin_user):
    """
    Admin can successfully create a gift.
    """
    api_client.force_authenticate(user=admin_user)
    url = reverse("gifts")

    new_data = {
        "name": "Admin New Gift",
        "mltc": org_setup['mltc_allowed'].name,
        "birth_month": 5,
    }

    resp = api_client.post(url, new_data, format="json")
    assert resp.status_code == 201
    assert resp.data["name"] == "Admin New Gift"
    assert resp.data.get("birth_month") == 5
    assert resp.data["mltc"] == org_setup['mltc_allowed'].name

@pytest.mark.django_db
def test_create_gift_denied_for_unrelated_mltc(api_client, org_setup, regular_user):
    """
    Regular user cannot create a gift with an MLTC they are not allowed to use.
    """
    api_client.force_authenticate(user=regular_user)
    url = reverse("gifts")

    new_data = {
        "name": "Invalid Gift",
        "mltc": org_setup['mltc_denied'].name,  # not in allowed_mltcs
        "birth_month": 5,
    }

    resp = api_client.post(url, new_data, format="json")
    assert resp.status_code == 403
    assert "detail" in resp.data

@pytest.mark.django_db
def test_create_gift_missing_required_fields(api_client, admin_user):
    """
    API should reject gift creation if required fields are missing.
    """
    api_client.force_authenticate(user=admin_user)
    url = reverse("gifts")

    resp = api_client.post(url, {}, format="json")
    assert resp.status_code == 400
    assert "name" in resp.data

# ==============================
# Gift Update Tests
# ==============================

@pytest.mark.django_db
def test_update_gift_success_for_regular_user(api_client, org_setup, regular_user):
    """
    Regular user can update a gift.
    """
    sadc = org_setup['sadc']
    mltc_allowed = org_setup['mltc_allowed']
    gift = Gift.objects.create(name="Gift To Update", sadc=sadc, mltc=mltc_allowed)

    api_client.force_authenticate(user=regular_user)
    url = reverse("gift", args=[gift.id])

    update_data = {
        "name": "Updated Gift",
        "mltc": mltc_allowed.name,
        "birth_month": 7,
    }

    resp = api_client.put(url, update_data, format="json")
    assert resp.status_code == 200
    assert resp.data["name"] == "Updated Gift"
    assert resp.data.get("birth_month") == 7
    assert resp.data["mltc"] == mltc_allowed.name

@pytest.mark.django_db
def test_update_gift_success_for_admin(api_client, org_setup, admin_user):
    """
    Admin can update gift details.
    """
    sadc = org_setup['sadc']
    mltc_allowed = org_setup['mltc_allowed']
    gift = Gift.objects.create(name="Admin Gift To Update", sadc=sadc, mltc=mltc_allowed)

    api_client.force_authenticate(user=admin_user)
    url = reverse("gift", args=[gift.id])

    update_data = {
        "name": "Admin Updated Gift",
        "mltc": mltc_allowed.name,
        "birth_month": 8,
    }

    resp = api_client.put(url, update_data, format="json")
    assert resp.status_code == 200
    assert resp.data["name"] == "Admin Updated Gift"
    assert resp.data.get("birth_month") == 8
    assert resp.data["mltc"] == mltc_allowed.name

@pytest.mark.django_db
def test_update_nonexistent_gift_returns_404(api_client, admin_user):
    """
    Updating a gift that doesn't exist should return 404.
    """
    api_client.force_authenticate(user=admin_user)
    url = reverse("gift", args=[9999])  # unlikely to exist

    resp = api_client.put(url, {
        "name": "Doesn't Matter",
        "mltc": None,
        "birth_month": 6
    }, format="json")

    assert resp.status_code == 404

# ==============================
# Gift Deletion Tests
# ==============================

@pytest.mark.django_db
def test_delete_gift_success_for_regular_user(api_client, org_setup, regular_user):
    """
    Regular user can delete a gift.
    """
    sadc = org_setup['sadc']
    mltc_allowed = org_setup['mltc_allowed']
    gift = Gift.objects.create(name="Gift To Delete", sadc=sadc, mltc=mltc_allowed)

    api_client.force_authenticate(user=regular_user)
    url = reverse("gift", args=[gift.id])

    resp = api_client.delete(url)
    assert resp.status_code == 204
    assert not Gift.objects.filter(id=gift.id).exists()

@pytest.mark.django_db
def test_delete_gift_success_for_admin(api_client, org_setup, admin_user):
    """
    Admin can delete a gift.
    """
    sadc = org_setup['sadc']
    mltc_allowed = org_setup['mltc_allowed']
    gift = Gift.objects.create(name="Admin Gift To Delete", sadc=sadc, mltc=mltc_allowed)

    api_client.force_authenticate(user=admin_user)
    url = reverse("gift", args=[gift.id])

    resp = api_client.delete(url)
    assert resp.status_code == 204
    assert not Gift.objects.filter(id=gift.id).exists()

@pytest.mark.django_db
def test_delete_nonexistent_gift_returns_404(api_client, admin_user):
    """
    Deleting a non-existent gift should return 404.
    """
    api_client.force_authenticate(user=admin_user)
    url = reverse("gift", args=[9999])

    resp = api_client.delete(url)
    assert resp.status_code == 404

@pytest.mark.django_db
def test_delete_gift_unauthorized(api_client, regular_user, other_org_setup):
    """
    Regular user cannot delete a gift from another SADC.
    """
    other_sadc = other_org_setup['other_sadc']
    gift = Gift.objects.create(name="Other SADC Gift To Delete", sadc=other_sadc)

    api_client.force_authenticate(user=regular_user)
    url = reverse("gift", args=[gift.id])
    resp = api_client.delete(url)

    assert resp.status_code == 403
    assert Gift.objects.filter(id=gift.id).exists()

# ==============================
# Gift Field Validation Tests
# ==============================

@pytest.mark.django_db
def test_birth_month_out_of_range(api_client, admin_user, org_setup):
    """
    Birth month should be validated to be between 1 and 12.
    """
    api_client.force_authenticate(user=admin_user)
    url = reverse("gifts")

    resp = api_client.post(url, {
        "name": "Bad Month Gift",
        "mltc": org_setup['mltc_allowed'].name,
        "birth_month": 15
    }, format="json")

    assert resp.status_code == 400
    assert "birth_month" in resp.data

@pytest.mark.django_db
def test_birth_month_non_integer(api_client, admin_user, org_setup):
    """
    Birth month must be an integer.
    """
    api_client.force_authenticate(user=admin_user)
    url = reverse("gifts")

    resp = api_client.post(url, {
        "name": "Bad Month Gift",
        "mltc": org_setup['mltc_allowed'].name,
        "birth_month": "not_an_int"
    }, format="json")

    assert resp.status_code == 400
    assert "birth_month" in resp.data