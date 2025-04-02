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
    diagnosis = DiagnosisSerializer()
    mltc = MLTCSerializer()

    class Meta:
        model = Authorization
        fields = '__all__'