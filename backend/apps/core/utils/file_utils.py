from django.db import transaction
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import get_object_or_404
from ..models.file_model import File
from ..serializers.file_serializers import FileSerializer
from ....utils.supabase import *
from django.utils.text import slugify
from backend.access.member_access import (
    check_member_access, 
    member_access_filter, 
    member_access_fk
)

@member_access_filter()
def getFileList(request):
    files = File.objects.filter(member__in=request.accessible_members_qs)
    serializer = FileSerializer(files, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

def getFileDetail(request, pk):
    file = get_object_or_404(File, id=pk)

    unauthorized = check_member_access(request.user, file.member_id)
    if unauthorized: return unauthorized

    serializer = FileSerializer(file)
    return Response(serializer.data, status=status.HTTP_200_OK)

@member_access_fk
@transaction.atomic
def createFile(request):
    data = request.data.copy()
    public_url = None

    try:
        if 'file' in request.FILES:
            file_obj = request.FILES['file']
            file_name = slugify(request.data.get("name"))
            member_id = request.data.get("member")
            member_sadc = request.user.sadc.id
            new_path = f"{member_sadc}/members/{member_id}/files/{file_name}"

            public_url, error = upload_file_to_supabase(
                file_obj, 
                new_path,
                None,
            )

            if error:
                raise Exception(f"File upload failed: {error}")

            data['file'] = public_url

        serializer = FileSerializer(data=data)
        
        try:
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(e)
            return Response({"detail": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    except Exception as e:
        if public_url:
            delete_file_from_supabase(public_url)
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@member_access_fk
@transaction.atomic
def updateFile(request, pk):
    data = request.data.copy()
    file = get_object_or_404(File, id=pk)
    public_url = None

    try:
        if 'file' in request.FILES:
            file_obj = request.FILES['file']
            file_name = slugify(request.data.get("name"))
            member_id = request.data.get("member")
            member_sadc = request.user.sadc.id
            new_path = f"{member_sadc}/members/{member_id}/files/{file_name}"

            public_url, error = upload_file_to_supabase(
                file_obj,
                new_path, 
                file.file,
            )

            if error:
                raise Exception(f"File upload failed: {error}")

            data['file'] = public_url

        serializer = FileSerializer(instance=file, data=data, partial=True)
        try:
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(e)
            return Response({"detail": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    except Exception as e:
        if public_url:
            delete_file_from_supabase(public_url)
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@member_access_fk
def deleteFile(request, pk, member_pk):
    file = get_object_or_404(File, id=pk)
    if file.file:
        delete_file_from_supabase(file.file)
    else:
        print(f"No file URL to delete for File ID {file.id}")
    file.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)