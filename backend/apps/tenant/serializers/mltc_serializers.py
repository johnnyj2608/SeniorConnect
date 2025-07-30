from rest_framework import serializers
from ..models.mltc_model import Mltc

class MltcSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mltc
        exclude = ['created_at', 'updated_at', 'sadc']