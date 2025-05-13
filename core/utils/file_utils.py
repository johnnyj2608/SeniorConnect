from rest_framework.response import Response
from ..models.file_model import File
from ..serializers.file_serializer import FileSerializer

def getFileList(request):
    files = File.objects.all()
    serializer = FileSerializer(files, many=True)
    return Response(serializer.data)

def getFileDetail(request, pk):
    file = File.objects.get(id=pk)
    serializer = FileSerializer(file)
    return Response(serializer.data)

def createFile(request):
    serializer = FileSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    else:
        print(serializer.errors)
        return Response(serializer.errors, status=400)

def updateFile(request, pk):
    data = request.data
    file = File.objects.get(id=pk)
    serializer = FileSerializer(instance=file, data=data)

    if serializer.is_valid():
        serializer.save()
    else:
        print(serializer.errors)
    return Response(serializer.data)

def deleteFile(request, pk):
    file = File.objects.get(id=pk)
    file.delete()
    return Response('File was deleted')


def getFileListByMember(request, member_pk):
    files = File.objects.filter(member=member_pk)
    serializer = FileSerializer(files, many=True)
    return Response(serializer.data)