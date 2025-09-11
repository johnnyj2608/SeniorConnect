from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from .utils.supabase import get_signed_url
from urllib.parse import unquote

@api_view(['GET'])
def viewFile(request, file_path):
    file_path = unquote(file_path)
    if not file_path:
        return Response({"detail": "Missing file_path."}, status=status.HTTP_400_BAD_REQUEST)

    signed_url = get_signed_url(file_path, expires_in=300)
    if not signed_url:
        return Response({"detail": "Could not generate signed URL."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({"url": signed_url}, status=status.HTTP_200_OK)