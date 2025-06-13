from functools import wraps
from rest_framework.response import Response
from rest_framework import status
from .models.member_model import Member

def member_access_pk(func):
    @wraps(func)
    def wrapper(request, *args, **kwargs):
        member_id = kwargs.get('pk')
        if member_id is None and len(args) > 0:
            member_id = args[0]
        
        if member_id is None:
            return Response({"detail": "Member ID (pk) required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            member_id = int(member_id)
        except Exception:
            return Response({"detail": "Invalid member ID."}, status=status.HTTP_400_BAD_REQUEST)

        accessible_ids = set(Member.objects.accessible_by(request.user).values_list('id', flat=True))
        if member_id not in accessible_ids:
            return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

        return func(request, *args, **kwargs)

    return wrapper

def member_access_fk(func):
    @wraps(func)
    def wrapper(request, *args, **kwargs):
        member_id = kwargs.get('member_pk') or request.data.get('member')
        
        if member_id is None:
            return Response({"detail": "Member ID required in 'member_pk' or 'member'."},
                            status=status.HTTP_400_BAD_REQUEST)
        try:
            member_id = int(member_id)
        except Exception:
            return Response({"detail": "Invalid member ID."}, status=status.HTTP_400_BAD_REQUEST)

        accessible_ids = set(Member.objects.accessible_by(request.user).values_list('id', flat=True))
        if member_id not in accessible_ids:
            return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

        return func(request, *args, **kwargs)

    return wrapper

def member_access_filter(func):
    @wraps(func)
    def wrapper(request, *args, **kwargs):
        request.accessible_members_qs = Member.objects.accessible_by(request.user)
        return func(request, *args, **kwargs)

    return wrapper