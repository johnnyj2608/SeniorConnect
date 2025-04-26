from rest_framework.response import Response
from rest_framework.decorators import api_view
from ..utils.file_utils import (
    getFileTabList,
    getFileTabDetail,
    createFileTab,
    updateFileTab,
    deleteFileTab,
    getFileVersionList,
    getFileVersionDetail,
    createFileVersion,
    updateFileVersion,
    deleteFileVersion,
    getFileTabVersionsByMember,
    getFileTabLatestVersionsByMember,
)

# File Views
@api_view(['GET'])
def getFilesByMember(request, pk):
    if request.method == 'GET':
        return getFileTabVersionsByMember(request, pk)

@api_view(['GET'])
def getFilesLatestByMember(request, pk):
    if request.method == 'GET':
        return getFileTabLatestVersionsByMember(request, pk)

# FileTab Views
@api_view(['GET', 'POST'])
def getFileTabs(request):
    if request.method == 'GET':
        return getFileTabList(request)
    if request.method == 'POST':
        return createFileTab(request)

@api_view(['GET', 'PUT', 'DELETE'])
def getFileTab(request, pk):
    if request.method == 'GET':
        return getFileTabDetail(request, pk)
    if request.method == 'PUT':
        return updateFileTab(request, pk)
    if request.method == 'DELETE':
        return deleteFileTab(request, pk)

# FileVersion Views
@api_view(['GET', 'POST'])
def getFileVersions(request):
    if request.method == 'GET':
        return getFileVersionList(request)
    if request.method == 'POST':
        return createFileVersion(request)

@api_view(['GET', 'PUT', 'DELETE'])
def getFileVersion(request, pk):
    if request.method == 'GET':
        return getFileVersionDetail(request, pk)
    if request.method == 'PUT':
        return updateFileVersion(request, pk)
    if request.method == 'DELETE':
        return deleteFileVersion(request, pk)