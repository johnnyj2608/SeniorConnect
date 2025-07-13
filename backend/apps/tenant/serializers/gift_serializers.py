from rest_framework import serializers
from ..models.gift_model import Gift

class GiftSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gift
        exclude = ['created_at', 'updated_at']

