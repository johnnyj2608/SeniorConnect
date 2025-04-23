from rest_framework import serializers
from ..models.authorization_model import Authorization, MLTC

class MLTCSerializer(serializers.ModelSerializer):
    class Meta:
        model = MLTC
        fields = '__all__'

class AuthorizationSerializer(serializers.ModelSerializer):
    mltc = serializers.SlugRelatedField(queryset=MLTC.objects.all(), slug_field='name')

    class Meta:
        model = Authorization
        fields = '__all__'

    def validate(self, data):
        start = data.get('start_date')
        end = data.get('end_date')

        if start and end and end < start:
            raise serializers.ValidationError("End date cannot be before start date.")
        
        return data