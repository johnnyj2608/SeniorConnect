from rest_framework import serializers
from ..models.mltc_model import Mltc

class MltcSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mltc
        fields = '__all__'