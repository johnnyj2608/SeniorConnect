import pytest
from rest_framework import status
from backend.apps.core.models.gifted_model import Gifted
from django.urls import reverse

# ==============================
# Gifted Listing Tests
# ==============================

@pytest.mark.django_db
def test_get_gifteds_list(api_client_regular, members_setup):
    member = members_setup["members"][0]
    Gifted.objects.create(member=member, gift_id=1, name="Shoes", received=True)

    url = reverse("gifteds") 
    response = api_client_regular.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]["name"] == "Shoes"

@pytest.mark.django_db
def test_get_gifteds_by_member(api_client_regular, members_setup):
    member = members_setup["members"][0]
    Gifted.objects.create(member=member, gift_id=4, name="Shoes", received=True)

    url = reverse("gifted_by_member", args=[member.id])
    response = api_client_regular.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]["name"] == "Shoes"

@pytest.mark.django_db
def test_get_empty_gifted_list(api_client_regular, members_setup):
    member = members_setup["members"][0]
    url = reverse("gifted_by_member", args=[member.id])
    response = api_client_regular.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data == []

# ==============================
# Gifted Detail Tests
# ==============================

@pytest.mark.django_db
def test_get_gifted_detail(api_client_regular, members_setup):
    member = members_setup["members"][0]
    gifted = Gifted.objects.create(member=member, gift_id=1, name="Gloves", received=True)

    url = reverse("gifted", args=[gifted.id])
    response = api_client_regular.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert response.data["name"] == "Gloves"

@pytest.mark.django_db
def test_access_denied_for_other_org_member(api_client_regular, other_org_setup):
    other_member = other_org_setup["other_member"]
    gifted = Gifted.objects.create(member=other_member, gift_id=5, name="Forbidden Gift", received=True)

    url = reverse("gifted", args=[gifted.id])
    response = api_client_regular.get(url)

    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.data["detail"] == "Not authorized."

@pytest.mark.django_db
def test_get_gifted_detail_not_found(api_client_regular):
    url = reverse("gifted", args=[9999])
    response = api_client_regular.get(url)
    assert response.status_code == status.HTTP_404_NOT_FOUND

# ==============================
# Gifted Create Tests
# ==============================

@pytest.mark.django_db
def test_create_gifted(api_client_regular, members_setup):
    member = members_setup["members"][0]

    url = reverse("gifteds")
    payload = {"member": member.id, "gift_id": 99, "name": "Jacket", "received": True}
    response = api_client_regular.post(url, data=payload, format="json")

    assert response.status_code == status.HTTP_201_CREATED
    assert Gifted.objects.filter(member=member, gift_id=99).exists()

@pytest.mark.django_db
def test_create_gifted_received_false_returns_204(api_client_regular, members_setup):
    member = members_setup["members"][0]

    url = reverse("gifteds")
    payload = {"member": member.id, "gift_id": 100, "name": "Hat", "received": False}
    response = api_client_regular.post(url, data=payload, format="json")

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not Gifted.objects.filter(member=member, gift_id=100).exists()

# ==============================
# Gifted Update Tests
# ==============================

@pytest.mark.django_db
def test_update_gifted(api_client_regular, members_setup):
    member = members_setup["members"][0]
    gifted = Gifted.objects.create(member=member, gift_id=1, name="Watch", received=True)

    url = reverse("gifted", args=[gifted.id])
    payload = {"member": member.id, "gift_id": 1, "name": "Updated Watch", "received": True}
    response = api_client_regular.put(url, data=payload, format="json")

    assert response.status_code == status.HTTP_200_OK
    gifted.refresh_from_db()
    assert gifted.name == "Updated Watch"

@pytest.mark.django_db
def test_update_gifted_received_false_deletes(api_client_regular, members_setup):
    member = members_setup["members"][0]
    gifted = Gifted.objects.create(member=member, gift_id=2, name="Scarf", received=True)

    url = reverse("gifted", args=[gifted.id])
    payload = {"member": member.id, "gift_id": 2, "name": "Scarf", "received": False}
    response = api_client_regular.put(url, data=payload, format="json")

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not Gifted.objects.filter(id=gifted.id).exists()

@pytest.mark.django_db
def test_update_gifted_access_denied(api_client_regular, other_org_setup):
    other_member = other_org_setup["other_member"]
    gifted = Gifted.objects.create(member=other_member, gift_id=5, name="Forbidden", received=True)

    url = reverse("gifted", args=[gifted.id])
    payload = {"member": other_member.id, "gift_id": 5, "name": "Hacked", "received": True}
    response = api_client_regular.put(url, data=payload, format="json")

    assert response.status_code == status.HTTP_403_FORBIDDEN