from rest_framework import serializers
from ..models.mltc_model import MLTC

class MLTCSerializer(serializers.ModelSerializer):
    class Meta:
        model = MLTC
        fields = '__all__'