from rest_framework import serializers
from ..models.gifted_model import Gifted

class GiftedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gifted
        exclude = ['created_at', 'updated_at']