from rest_framework.response import Response
from ..models.file_model import FileTab, FileVersion
from ..serializers.file_serializer import FileTabSerializer, FileVersionSerializer
import json
from datetime import datetime

# File Utils
def getFileTabVersionsByMember(request, member_id):
    file_tabs = FileTab.objects.filter(member_id=member_id)
    file_tabs_with_versions = []

    for file_tab in file_tabs:
        versions = FileVersion.objects.filter(tab=file_tab)
        serialized_versions = FileVersionSerializer(versions, many=True).data
        
        file_tabs_with_versions.append({
            'id': file_tab.id,
            'member': member_id,
            'name': file_tab.name,
            'created_at': file_tab.created_at,
            'versions': serialized_versions
        })

    return Response(file_tabs_with_versions)

def getFileTabLatestVersionsByMember(request, member_id):
    file_tabs = FileTab.objects.filter(member_id=member_id)
    file_tabs_with_versions = []

    for file_tab in file_tabs:
        latest_version = FileVersion.objects.filter(tab=file_tab).first()
        
        if latest_version:
            latest_version_data = FileVersionSerializer(latest_version).data
            
            file_tabs_with_versions.append({
                'name': file_tab.name,
                'content': latest_version_data
            })

    return Response(file_tabs_with_versions)

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
    serializer = FileTabSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    else:
        print(serializer.errors)
        return Response(serializer.errors, status=400)

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
    serializer = FileVersionSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    else:
        print(serializer.errors)
        return Response(serializer.errors, status=400)

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