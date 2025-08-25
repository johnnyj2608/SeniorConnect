from rest_framework.response import Response
from rest_framework import status

def require_sadc_ownership(sadc_input, user):
    try:
        sadc_id = int(sadc_input)
    except (TypeError, ValueError):
        return Response({"detail": "Invalid SADC ID."}, status=status.HTTP_400_BAD_REQUEST)

    if sadc_id != getattr(user.sadc, 'id', None):
        return Response({"detail": "Not authorized."}, status=status.HTTP_404_NOT_FOUND)
    return None

def require_org_admin(user):
    if not getattr(user, 'is_org_admin', False):
        return Response({"detail": "Not authorized."}, status=status.HTTP_404_NOT_FOUND)
    return None

def require_self_or_admin(obj, user):
    if not (getattr(user, 'is_org_admin', False) or getattr(user, 'id', None) == getattr(obj, 'id', None)):
        return Response({"detail": "Not authorized."}, status=status.HTTP_404_NOT_FOUND)
    return None

def require_valid_mltc(obj, user):
    if obj is None:
        return None

    if getattr(obj, 'sadc', None) != getattr(user, 'sadc', None):
        return Response({"detail": "Not authorized."}, status=status.HTTP_404_NOT_FOUND)

    if not getattr(user, 'is_org_admin', False) and obj not in user.allowed_mltcs.all():
        return Response({"detail": "Not authorized."}, status=status.HTTP_404_NOT_FOUND)

    return None