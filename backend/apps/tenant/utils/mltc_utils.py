from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import get_object_or_404
from ..models.mltc_model import Mltc
from ..serializers.mltc_serializers import MltcSerializer

def getMltcList(request):
    mltcs = Mltc.objects.select_related('sadc').filter(sadc=request.user.sadc)

    user = request.user
    if not (user.is_superuser or user.is_org_admin):
        mltcs = mltcs.filter(id__in=user.allowed_mltcs.values_list('id', flat=True))

    serializer = MltcSerializer(mltcs, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

def getMltcDetail(request, pk):
    current_user = request.user
    mltc = get_object_or_404(Mltc.objects.select_related('sadc'), id=pk)

    if mltc.sadc_id != current_user.sadc_id:
        return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

    if current_user.is_org_admin:
        serializer = MltcSerializer(mltc)
        return Response(serializer.data, status=status.HTTP_200_OK)

    return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

def createMltc(request):
    current_user = request.user
    if not (current_user.is_org_admin):
        return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)
    data = request.data.copy()
    data['sadc'] = request.user.sadc.id

    data['dx_codes'] = data.getlist('dx_codes', '')[0]
    serializer = MltcSerializer(data=data)

    try:
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(e)
        return Response({"detail": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def updateMltc(request, pk):
    current_user = request.user
    mltc = get_object_or_404(Mltc.objects.select_related('sadc'), id=pk)

    if mltc.sadc_id != current_user.sadc_id:
        return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

    if not (current_user.is_org_admin):
        return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

    data = request.data.copy()
    data['sadc'] = request.user.sadc.id
    serializer = MltcSerializer(instance=mltc, data=data)

    try:
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(e)
        return Response({"detail": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def deleteMltc(request, pk):
    current_user = request.user
    mltc = get_object_or_404(Mltc.objects.select_related('sadc'), id=pk)

    if mltc.sadc_id != current_user.sadc_id:
        return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)
    
    if not current_user.is_org_admin:
        return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

    mltc.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)  