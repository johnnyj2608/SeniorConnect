from rest_framework import serializers
from ..models.authorization_model import Authorization, DX_Code, MLTC

class MLTCSerializer(serializers.ModelSerializer):
    class Meta:
        model = MLTC
        fields = '__all__'

class DiagnosisSerializer(serializers.ModelSerializer):
    class Meta:
        model = DX_Code
        fields = '__all__'

class AuthorizationSerializer(serializers.ModelSerializer):
    dx_code = serializers.SlugRelatedField(
        queryset=DX_Code.objects.all(), 
        slug_field='name', 
        allow_null=True,
        required=False
    )
    mltc = serializers.SlugRelatedField(queryset=MLTC.objects.all(), slug_field='name')

    class Meta:
        model = Authorization
        fields = '__all__'