from rest_framework.serializers import ModelSerializer
from ..models.authorization_model import Authorization, Diagnosis
from .mltc_serializer import MLTCSerializer

class DiagnosisSerializer(ModelSerializer):
    class Meta:
        model = Diagnosis
        fields = '__all__'

class AuthorizationSerializer(ModelSerializer):
    diagnosis = DiagnosisSerializer()
    mltc = MLTCSerializer()

    class Meta:
        model = Authorization
        fields = '__all__'