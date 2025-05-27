from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import get_object_or_404
from .models import AuditLog
from .serializers import AuditLogSerializer
from core.utils import handle_serializer
from rest_framework.pagination import PageNumberPagination

def getAuditList(request):
    audits = AuditLog.objects.select_related('user', 'content_type', 'member').all()
    filter_param = request.GET.get('filter')
    if filter_param:
        audits = audits.filter(action_type__iexact=filter_param)
    paginator = PageNumberPagination()
    result_page = paginator.paginate_queryset(audits, request)
    serializer = AuditLogSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)

def getAuditDetail(request, pk):
    audit = get_object_or_404(AuditLog, id=pk)
    serializer = AuditLogSerializer(audit)
    return Response(serializer.data, status=status.HTTP_200_OK)

def createAudit(request):
    data = request.data
    serializer = AuditLogSerializer(data=data)
    return handle_serializer(serializer, success_status=status.HTTP_201_CREATED)

def updateAudit(request, pk):
    data = request.data
    audit = get_object_or_404(AuditLog, id=pk)
    serializer = AuditLogSerializer(instance=audit, data=data)
    return handle_serializer(serializer, success_status=status.HTTP_200_OK)

def deleteAudit(request, pk):
    audit = get_object_or_404(AuditLog, id=pk)
    audit.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)