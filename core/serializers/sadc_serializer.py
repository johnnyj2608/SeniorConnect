from rest_framework import serializers
from ..models.sadc_model import SADC

class MLTCSerializer(serializers.ModelSerializer):
    class Meta:
        model = SADC
        fields = '__all__'