from rest_framework.response import Response
from django.db.models.functions import TruncDate
from collections import defaultdict
from rest_framework import status
from datetime import timedelta
from django.utils import timezone
from rest_framework.generics import get_object_or_404
from ..models.audit_model import AuditLog
from ..serializers.audit_serializers import AuditLogSerializer
from rest_framework.pagination import PageNumberPagination
from backend.access.member_access import check_member_access, member_access_filter, member_access_fk

@member_access_filter()
def getAuditList(request):
    audits = AuditLog.objects.select_related('user', 'content_type', 'member').filter(
        member__in=request.accessible_members_qs
    )
    filter_param = request.GET.get('filter')
    if filter_param:
        audits = audits.filter(action_type__iexact=filter_param)
    paginator = PageNumberPagination()
    result_page = paginator.paginate_queryset(audits, request)
    serializer = AuditLogSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)

def getAuditDetail(request, pk):
    audit = get_object_or_404(AuditLog.objects.select_related('user', 'content_type', 'member'), id=pk)

    unauthorized = check_member_access(request.user, audit.member_id)
    if unauthorized: return unauthorized
    
    serializer = AuditLogSerializer(audit)
    return Response(serializer.data, status=status.HTTP_200_OK)

@member_access_filter()
def getRecentAudits(request):
    seven_days_ago = timezone.now() - timedelta(days=7)
    recent_audits = (
        AuditLog.objects
        .select_related('user', 'content_type', 'member')
        .filter(
            timestamp__gte=seven_days_ago,
            member__isnull=False,
            member__in=request.accessible_members_qs,
        )
        .annotate(date=TruncDate('timestamp'))
        .order_by('-timestamp')[:20]
    )

    grouped = defaultdict(list)
    for audit in recent_audits:
        grouped[audit.date].append(audit)

    data = []
    for date, audit_list in grouped.items():
        serializer = AuditLogSerializer(audit_list, many=True)
        data.append({
            'date': date,
            'audits': serializer.data
        })

    return Response(data, status=status.HTTP_200_OK)