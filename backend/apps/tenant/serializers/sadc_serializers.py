from rest_framework import serializers
from ..models.sadc_model import Sadc

class SadcSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sadc
        exclude = ['active', 'created_at', 'updated_at']
        read_only_fields = [
            'id',
            'name',
            'email',
            'phone',
            'address',
            'npi',
        ]