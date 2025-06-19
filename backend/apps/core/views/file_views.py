from rest_framework.response import Response
from rest_framework.decorators import api_view
from ..utils.file_utils import (
    updateFile,
    getFileDetail,
    deleteFile,
    getFileList,
    createFile,
    getFileListByMember,
)

@api_view(['GET', 'POST'])
def getFiles(request):

    if request.method == 'GET':
        return getFileList(request)

    if request.method == 'POST':
        return createFile(request)


@api_view(['GET', 'PUT'])
def getFile(request, pk):

    if request.method == 'GET':
        return getFileDetail(request, pk=pk)

    if request.method == 'PUT':
        return updateFile(request, pk=pk)

@api_view(['DELETE'])
def fileDelete(request, pk, member_pk):
    if request.method == 'DELETE':
        return deleteFile(request, pk=pk, member_pk=member_pk)
    
@api_view(['GET'])
def getFilesByMember(request, pk):
    if request.method == 'GET':
        return getFileListByMember(request, member_pk=pk)