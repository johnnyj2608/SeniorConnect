from rest_framework.serializers import ModelSerializer
from ..models.sadc_model import SADC

class MLTCSerializer(ModelSerializer):
    class Meta:
        model = SADC
        fields = '__all__'