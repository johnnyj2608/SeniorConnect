from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import get_object_or_404
from ..models.member_model import Language
from ..serializers.member_serializers import LanguageSerializer
from .handle_serializer import handle_serializer

def getLanguageList(request):
    languages = Language.objects.all()
    serializer = LanguageSerializer(languages, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

def getLanguageDetail(request, pk):
    language = get_object_or_404(Language, id=pk)
    serializer = LanguageSerializer(language)
    return Response(serializer.data, status=status.HTTP_200_OK)

def createLanguage(request):
    data = request.data
    serializer = LanguageSerializer(data=data)
    return handle_serializer(serializer, success_status=status.HTTP_201_CREATED)

def updateLanguage(request, pk):
    data = request.data
    language = get_object_or_404(Language, id=pk)
    serializer = LanguageSerializer(instance=language, data=data)
    return handle_serializer(serializer, success_status=status.HTTP_200_OK)

def deleteLanguage(request, pk):
    language = get_object_or_404(Language, id=pk)
    language.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)