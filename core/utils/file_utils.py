from rest_framework.response import Response
from ..models.file_model import FileTab, FileVersion
from ..models.member_model import Member
from ..serializers.file_serializer import FileTabSerializer, FileVersionSerializer

# FileTab Utils
def getFileTabList(request):
    file_tabs = FileTab.objects.all()
    serializer = FileTabSerializer(file_tabs, many=True)
    return Response(serializer.data)

def getFileTabDetail(request, pk):
    file_tab = FileTab.objects.get(id=pk)
    serializer = FileTabSerializer(file_tab)
    return Response(serializer.data)

def createFileTab(request):
    data = request.data

    member = Member.objects.get(id=data['member'])

    file_tab = FileTab.objects.create(
        member=member,
        name=data['name']
    )
    serializer = FileTabSerializer(file_tab)
    return Response(serializer.data)

def updateFileTab(request, pk):
    data = request.data
    file_tab = FileTab.objects.get(id=pk)
    serializer = FileTabSerializer(instance=file_tab, data=data)
    
    if serializer.is_valid():
        serializer.save()
    else:
        return Response(serializer.errors, status=400)
    
    return Response(serializer.data)

def deleteFileTab(request, pk):
    file_tab = FileTab.objects.get(id=pk)
    file_tab.delete()
    return Response('FileTab was deleted')

def getFileTabsListByMember(request, member_id):
    file_tabs = FileTab.objects.filter(member_id=member_id)
    serializer = FileTabSerializer(file_tabs, many=True)
    return Response(serializer.data)

def getFileTabsWithLatestVersionByMember(request, member_id):
    file_tabs = FileTab.objects.filter(member_id=member_id)
    file_tabs_with_versions = {}

    for file_tab in file_tabs:
        latest_version = FileVersion.objects.filter(tab=file_tab).first()
        if latest_version:
            latest_version_data = FileVersionSerializer(latest_version).data
            file_tabs_with_versions[file_tab.name] = latest_version_data
    return Response(file_tabs_with_versions)

# FileVersion Utils
def getFileVersionList(request):
    file_versions = FileVersion.objects.all()
    serializer = FileVersionSerializer(file_versions, many=True)
    return Response(serializer.data)

def getFileVersionDetail(request, pk):
    file_version = FileVersion.objects.get(id=pk)
    serializer = FileVersionSerializer(file_version)
    return Response(serializer.data)

def createFileVersion(request):
    data = request.data
    
    tab = FileTab.objects.get(id=data['tab'])

    file_version = FileVersion.objects.create(
        tab=tab,
        file=data['file'],
        completion_date=data.get('completion_date'),
        expiration_date=data.get('expiration_date')
    )
    serializer = FileVersionSerializer(file_version)
    return Response(serializer.data)

def updateFileVersion(request, pk):
    data = request.data
    file_version = FileVersion.objects.get(id=pk)
    serializer = FileVersionSerializer(instance=file_version, data=data)
    
    if serializer.is_valid():
        serializer.save()
    else:
        return Response(serializer.errors, status=400)
    
    return Response(serializer.data)

def deleteFileVersion(request, pk):
    file_version = FileVersion.objects.get(id=pk)
    file_version.delete()
    return Response('FileVersion was deleted')

def getFileVersionsListByTab(request, tab_id):
    file_versions = FileVersion.objects.filter(tab_id=tab_id)
    serializer = FileVersionSerializer(file_versions, many=True)
    return Response(serializer.data)
