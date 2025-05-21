from django.db import transaction
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import get_object_or_404
from ..models.file_model import File
from ..serializers.file_serializers import FileSerializer
from core.utils.supabase import *
from django.utils.text import slugify
from .handle_serializer import handle_serializer

def getFileList(request):
    files = File.objects.select_related('member').all()
    serializer = FileSerializer(files, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

def getFileDetail(request, pk):
    file = get_object_or_404(File.objects.select_related('member'), id=pk)
    serializer = FileSerializer(file)
    return Response(serializer.data, status=status.HTTP_200_OK)

def createFile(request):
    data = request.data.copy()
    public_url = None

    try:
        with transaction.atomic():
            if 'file' in request.FILES:
                file_obj = request.FILES['file']
                file_name = slugify(request.data.get("name"))
                member_id = request.data.get("member")

                new_path = f"{member_id}/{file_name}"
                public_url, error = upload_file_to_supabase(
                    file_obj, 
                    new_path,
                    None,
                )

                if error:
                    raise Exception(f"File upload failed: {error}")

                data['file'] = public_url

            serializer = FileSerializer(data=data)
            response = handle_serializer(serializer, success_status=status.HTTP_201_CREATED)

            if response.status_code >= 400:
                raise Exception("Serializer validation failed.")

            return response

    except Exception as e:
        if public_url:
            delete_file_from_supabase(public_url)
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def updateFile(request, pk):
    data = request.data.copy()
    file = get_object_or_404(File.objects.select_related('member'), id=pk)
    public_url = None

    try:
        with transaction.atomic():
            if 'file' in request.FILES:
                file_obj = request.FILES['file']
                file_name = slugify(request.data.get("name"))
                member_id = request.data.get("member")

                new_path = f"{member_id}/{file_name}"

                public_url, error = upload_file_to_supabase(
                    file_obj,
                    new_path, 
                    file.file,
                )

                if error:
                    raise Exception(f"File upload failed: {error}")

                data['file'] = public_url

            serializer = FileSerializer(instance=file, data=data)
            response = handle_serializer(serializer, success_status=status.HTTP_200_OK)

            if response.status_code >= 400:
                raise Exception("Serializer validation failed.")

            return response

    except Exception as e:
        if public_url:
            delete_file_from_supabase(public_url)
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def deleteFile(request, pk):
    file = get_object_or_404(File, id=pk)
    if file.file:
        file_path = get_relative_path_of_supabase(file.file)
        delete_file_from_supabase(file_path)
    file.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


def getFileListByMember(request, member_pk):
    files = File.objects.select_related('member').filter(member=member_pk)
    serializer = FileSerializer(files, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)