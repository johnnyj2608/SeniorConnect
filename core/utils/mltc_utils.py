from rest_framework.response import Response
from ..models.authorization_model import MLTC
from ..serializers.authorization_serializer import MLTCSerializer

def getMLTCList(request):
    mltcs = MLTC.objects.all()
    serializer = MLTCSerializer(mltcs, many=True)
    return Response(serializer.data)

def getMLTCDetail(request, pk):
    mltc = MLTC.objects.get(id=pk)
    serializer = MLTCSerializer(mltc)
    return Response(serializer.data)

def createMLTC(request):
    data = request.data
    mltc = MLTC.objects.create(
        name=data['name'],
        phone=data['phone'],
    )
    serializer = MLTCSerializer(mltc)
    return Response(serializer.data)

def updateMLTC(request, pk):
    data = request.data
    mltc = MLTC.objects.get(id=pk)
    serializer = MLTCSerializer(instance=mltc, data=data)

    if serializer.is_valid():
        serializer.save()
    else:
        print(serializer.errors)
    return Response(serializer.data)

def deleteMLTC(request, pk):
    mltc = MLTC.objects.get(id=pk)
    mltc.delete()
    return Response('MLTC was deleted')