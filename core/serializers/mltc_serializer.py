from rest_framework.serializers import ModelSerializer
from ..models.mltc_model import MLTC

class MLTCSerializer(ModelSerializer):
    class Meta:
        model = MLTC
        fields = '__all__'