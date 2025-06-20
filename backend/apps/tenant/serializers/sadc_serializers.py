from rest_framework import serializers
from ..models.sadc_model import Sadc

class SadcSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sadc
        exclude = ['created_at', 'updated_at']