from rest_framework import serializers
from ..models.gift_model import Gift
from ..models.mltc_model import Mltc

class GiftSerializer(serializers.ModelSerializer):
    mltc = serializers.SlugRelatedField(
        queryset=Mltc.objects.all(),
        slug_field='name',
        required=False,
        allow_null=True
    )

    class Meta:
        model = Gift
        exclude = ['created_at', 'updated_at']