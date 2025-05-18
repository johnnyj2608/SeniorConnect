from rest_framework.response import Response
from rest_framework.generics import get_object_or_404
from ..models.authorization_model import MLTC
from ..serializers.authorization_serializer import MLTCSerializer

def getMLTCList(request):
    mltcs = MLTC.objects.all()
    serializer = MLTCSerializer(mltcs, many=True)
    return Response(serializer.data)

def getMLTCDetail(request, pk):
    mltc = get_object_or_404(MLTC, id=pk)
    serializer = MLTCSerializer(mltc)
    return Response(serializer.data)

def createMLTC(request):
    data = request.data
    serializer = MLTCSerializer(data=data)

    if serializer.is_valid():
        try:
            serializer.save()
        except Exception as e:
            print(e)
    else:
        print("Serializer error:", serializer.errors)
        return Response(serializer.errors, status=400)
    return Response(serializer.data)

def updateMLTC(request, pk):
    data = request.data
    mltc = get_object_or_404(MLTC, id=pk)
    serializer = MLTCSerializer(instance=mltc, data=data)

    if serializer.is_valid():
        try:
            serializer.save()
        except Exception as e:
            print(e)
    else:
        print("Serializer error:", serializer.errors)
        return Response(serializer.errors, status=400)
    return Response(serializer.data)

def deleteMLTC(request, pk):
    mltc = get_object_or_404(MLTC, id=pk)
    mltc.delete()
    return Response('MLTC was deleted')