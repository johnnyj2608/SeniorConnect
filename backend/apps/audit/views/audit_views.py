from rest_framework.response import Response
from rest_framework.decorators import api_view
from ..utils.audit_utils import (
    getAuditDetail,
    getAuditList,
    getRecentAudits
)

@api_view(['GET'])
def getAudits(request):
    if request.method == 'GET':
        return getAuditList(request)

@api_view(['GET'])
def getAudit(request, pk):

    if request.method == 'GET':
        return getAuditDetail(request, pk)

@api_view(['GET'])
def getRecentAuditLogs(request):
    if request.method == 'GET':
        return getRecentAudits(request)