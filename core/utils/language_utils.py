from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import get_object_or_404
from ..models.member_model import Language
from ..serializers.member_serializers import LanguageSerializer

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
    
    try:
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(e)
        return Response({"detail": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def updateLanguage(request, pk):
    data = request.data
    language = get_object_or_404(Language, id=pk)
    serializer = LanguageSerializer(instance=language, data=data)
    
    try:
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(e)
        return Response({"detail": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def deleteLanguage(request, pk):
    language = get_object_or_404(Language, id=pk)
    language.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)