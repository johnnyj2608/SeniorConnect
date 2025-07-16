from rest_framework.response import Response
from rest_framework import status

def require_sadc_ownership(obj, user):
    if getattr(obj, 'sadc_id', None) != getattr(user, 'sadc_id', None):
        return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)
    return None

def require_org_admin(user):
    if not getattr(user, 'is_org_admin', False):
        return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)
    return None

def require_self_or_admin(obj, user):
    if not (getattr(user, 'is_org_admin', False) or getattr(user, 'id', None) == getattr(obj, 'id', None)):
        return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)
    return None