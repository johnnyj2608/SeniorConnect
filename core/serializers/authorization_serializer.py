from rest_framework.serializers import ModelSerializer
from ..models.authorization_model import Authorization, Diagnosis

class DiagnosisSerializer(ModelSerializer):
    class Meta:
        model = Diagnosis
        fields = '__all__'

class AddressSerializer(ModelSerializer):
    diagnosis = DiagnosisSerializer()

    class Meta:
        model = Authorization
        fields = '__all__'