import pytest
from rest_framework import status
from unittest.mock import patch

@pytest.mark.django_db
@pytest.mark.parametrize(
    "file_path, signed_url_return, expected_status, expected_url",
    [
        ("test.pdf", "https://supabase.test/file.pdf", status.HTTP_200_OK, "https://supabase.test/file.pdf"),
        ("missing.pdf", None, status.HTTP_500_INTERNAL_SERVER_ERROR, None),
    ]
)
@patch("backend.apps.common.views.get_signed_url")
def test_view_file(mock_get_signed_url, api_client_admin, file_path, signed_url_return, expected_status, expected_url):
    client = api_client_admin

    mock_get_signed_url.return_value = signed_url_return

    # Construct URL
    if file_path:
        url = f"/common/{file_path}/"
    else:
        url = f"/common/"  # empty path triggers 400

    response = client.get(url)

    assert response.status_code == expected_status
    if expected_url:
        assert response.data.get("url") == expected_url
    else:
        assert "detail" in response.data
