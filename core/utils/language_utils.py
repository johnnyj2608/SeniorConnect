from rest_framework.response import Response
from ..models.member_model import Language
from ..serializers.member_serializer import LanguageSerializer

def getLanguageList(request):
    languages = Language.objects.all()
    serializer = LanguageSerializer(languages, many=True)
    return Response(serializer.data)

def getLanguageDetail(request, pk):
    language = Language.objects.get(id=pk)
    serializer = LanguageSerializer(language)
    return Response(serializer.data)

def createLanguage(request):
    serializer = LanguageSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    else:
        print(serializer.errors)
        return Response(serializer.errors, status=400)

def updateLanguage(request, pk):
    data = request.data
    language = Language.objects.get(id=pk)
    serializer = LanguageSerializer(instance=language, data=data)

    if serializer.is_valid():
        serializer.save()
    else:
        print(serializer.errors)
    return Response(serializer.data)

def deleteLanguage(request, pk):
    language = Language.objects.get(id=pk)
    language.delete()
    return Response('Language was deleted')