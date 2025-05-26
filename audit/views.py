from rest_framework.response import Response
from rest_framework.decorators import api_view
from .utils import (
    updateAudit,
    getAuditDetail,
    deleteAudit,
    getAuditList,
    createAudit,
)

@api_view(['GET', 'POST'])
def getAudits(request):

    if request.method == 'GET':
        return getAuditList(request)

    if request.method == 'POST':
        return createAudit(request)


@api_view(['GET', 'PUT', 'DELETE'])
def getAudit(request, pk):

    if request.method == 'GET':
        return getAuditDetail(request, pk)

    if request.method == 'PUT':
        return updateAudit(request, pk)

    if request.method == 'DELETE':
        return deleteAudit(request, pk)