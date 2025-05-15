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
    data = request.data
    serializer = LanguageSerializer(data=data)

    if serializer.is_valid():
        try:
            serializer.save()
        except Exception as e:
            print(e)
    else:
        print("Serializer error:", serializer.errors)
        return Response(serializer.errors, status=400)
    return Response(serializer.data)

def updateLanguage(request, pk):
    data = request.data
    language = Language.objects.get(id=pk)
    serializer = LanguageSerializer(instance=language, data=data)

    if serializer.is_valid():
        try:
            serializer.save()
        except Exception as e:
            print(e)
    else:
        print("Serializer error:", serializer.errors)
        return Response(serializer.errors, status=400)
    return Response(serializer.data)

def deleteLanguage(request, pk):
    language = Language.objects.get(id=pk)
    language.delete()
    return Response('Language was deleted')