from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework import status
from backend.apps.tenant.models.mltc_model import Mltc

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

def require_valid_mltc(obj, user):
    if obj is None:
        return None

    if getattr(obj, 'sadc', None) != getattr(user, 'sadc', None):
        return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

    if not getattr(user, 'is_org_admin', False) and obj not in user.allowed_mltcs.all():
        return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

    return None

def require_valid_mltc(mltc, user):
    if mltc is None:
        return None

    if getattr(mltc, 'sadc', None) != getattr(user, 'sadc', None):
        return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

    if not getattr(user, 'is_org_admin', False) and mltc not in user.allowed_mltcs.all():
        return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

    return None