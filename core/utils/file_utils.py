from rest_framework.response import Response
from django.db import transaction
from ..models.file_model import FileTab, FileVersion
from ..serializers.file_serializer import FileTabSerializer, FileVersionSerializer
import json

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
    data = request.data.copy()
    files = request.FILES.getlist('files')
    versions = data.pop('versions', '[]')

    with transaction.atomic():
        serializer = FileTabSerializer(data=data)
        if serializer.is_valid():
            file_tab = serializer.save()

            version_instances = []
            latest_updated_at = file_tab.updated_at

            for i, version in enumerate(versions):
                version = json.loads(version)
                version['tab'] = file_tab.id

                if version.get('deleted'):
                    continue

                version['file'] = files[i]
                if version.get('completion_date') == '':
                    version['completion_date'] = None
                if version.get('expiration_date') == '':
                    version['expiration_date'] = None

                version_serializer = FileVersionSerializer(data=version)
                if version_serializer.is_valid():
                    version_instance = version_serializer.save()
                    version_instances.append(version_instance)

                    if version_instance.updated_at > latest_updated_at:
                        latest_updated_at = version_instance.updated_at
                else:
                    transaction.set_rollback(True)
                    print("Version serializer error:", version_serializer.errors)
                    return Response(version_serializer.errors, status=400)
                
            file_tab.updated_at = latest_updated_at
            file_tab.save()

            return Response({
                "file_tab": FileTabSerializer(file_tab).data,
                "versions": FileVersionSerializer(version_instances, many=True).data
            })
        else:
            print(serializer.errors)
            return Response(serializer.errors, status=400)

def updateFileTab(request, pk):
    data = request.data.copy()
    files = request.FILES.getlist('files')
    versions = data.pop('versions', '[]')

    with transaction.atomic():
        file_tab = FileTab.objects.get(id=pk)
        serializer = FileTabSerializer(instance=file_tab, data=data)

        if serializer.is_valid():
            file_tab = serializer.save()

            version_instances = []
            latest_updated_at = file_tab.updated_at

            for i, version in enumerate(versions):
                version = json.loads(version)
                version['tab'] = file_tab.id

                if version.get('deleted') and version['id'] != 'new':
                    FileVersion.objects.get(id=version['id']).delete()
                    continue

                version['file'] = files[i]
                if version.get('completion_date') == '':
                    version['completion_date'] = None
                if version.get('expiration_date') == '':
                    version['expiration_date'] = None

                if version['id'] == 'new':
                    version_serializer = FileVersionSerializer(data=version)
                else:
                    file_version = FileVersion.objects.get(id=version['id'])
                    version_serializer = FileVersionSerializer(instance=file_version, data=version)

                if version_serializer.is_valid():
                    version_instance = version_serializer.save()
                    version_instances.append(version_instance)

                    if version_instance.updated_at > latest_updated_at:
                        latest_updated_at = version_instance.updated_at
                else:
                    transaction.set_rollback(True)
                    print("Version serializer error:", version_serializer.errors)
                    return Response(version_serializer.errors, status=400)
            
            file_tab.updated_at = latest_updated_at
            file_tab.save()
                
            return Response({
                "file_tab": FileTabSerializer(file_tab).data,
                "versions": FileVersionSerializer(version_instances, many=True).data
            })
        else:
            print(serializer.errors)
            return Response(serializer.errors, status=400)

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