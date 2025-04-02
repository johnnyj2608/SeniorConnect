from rest_framework import serializers
from ..models.authorization_model import Authorization, Diagnosis, MLTC

class MLTCSerializer(serializers.ModelSerializer):
    class Meta:
        model = MLTC
        fields = '__all__'

class DiagnosisSerializer(serializers.ModelSerializer):
    class Meta:
        model = Diagnosis
        fields = '__all__'

class AuthorizationSerializer(serializers.ModelSerializer):
    diagnosis = serializers.SlugRelatedField(queryset=Diagnosis.objects.all(), slug_field='dx_code')
    mltc = serializers.SlugRelatedField(queryset=MLTC.objects.all(), slug_field='name')

    class Meta:
        model = Authorization
        fields = '__all__'