from rest_framework import serializers
from ..models.gifted_model import Gifted
from backend.apps.tenant.models.gift_model import Gift

class GiftedSerializer(serializers.ModelSerializer):
    gift = serializers.PrimaryKeyRelatedField(queryset=Gift.objects.all())
    name = serializers.CharField(source='gift.name', read_only=True)
    expires_at = serializers.DateTimeField(source='gift.expires_at', read_only=True)
    birth_month = serializers.IntegerField(source='gift.birth_month', read_only=True)
    mltc = serializers.CharField(source='gift.mltc.name', read_only=True)

    class Meta:
        model = Gifted
        exclude = ['created_at', 'updated_at']