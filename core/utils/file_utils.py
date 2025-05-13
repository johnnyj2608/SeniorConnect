from django.db import transaction
from rest_framework.response import Response
from ..models.file_model import File
from ..serializers.file_serializer import FileSerializer
from core.utils.supabase import *
from django.utils.text import slugify

def getFileList(request):
    files = File.objects.all()
    serializer = FileSerializer(files, many=True)
    return Response(serializer.data)

def getFileDetail(request, pk):
    file = File.objects.get(id=pk)
    serializer = FileSerializer(file)
    return Response(serializer.data)

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
            else:
                return Response({"error": "No file provided."}, status=400)

            serializer = FileSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            else:
                raise Exception("Serializer validation failed.")

    except Exception as e:
        if public_url:
            delete_file_from_supabase(public_url)
        return Response({"error": str(e)}, status=500)

def updateFile(request, pk):
    data = request.data.copy()
    file = File.objects.get(id=pk)
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
            else:
                return Response({"error": "No file provided."}, status=400)

            serializer = FileSerializer(instance=file, data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            else:
                raise Exception("Serializer validation failed.")

    except Exception as e:
        if public_url:
            delete_file_from_supabase(public_url)
        return Response({"error": str(e)}, status=500)

def deleteFile(request, pk):
    file = File.objects.get(id=pk)
    if file.file:
        file_path = get_relative_path_of_supabase(file.file)
        delete_file_from_supabase(file_path)
    file.delete()
    return Response('File was deleted')


def getFileListByMember(request, member_pk):
    files = File.objects.filter(member=member_pk)
    serializer = FileSerializer(files, many=True)
    return Response(serializer.data)