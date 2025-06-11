from rest_framework import serializers
from ..models.authorization_model import (
    MLTC, 
    Authorization, 
    AuthorizationService, 
    Enrollment
)
from .member_serializers import MemberNameSerializer
from .mixins import DateRangeValidationMixin

class MLTCSerializer(serializers.ModelSerializer):
    class Meta:
        model = MLTC
        fields = '__all__'

class AuthorizationServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuthorizationService
        exclude = ['created_at', 'updated_at']

class AuthorizationSerializer(serializers.ModelSerializer, DateRangeValidationMixin):
    mltc = serializers.SlugRelatedField(queryset=MLTC.objects.all(), slug_field='name')

    class Meta:
        model = Authorization
        exclude = ['created_at', 'updated_at']
    
class AuthorizationWithServiceSerializer(serializers.ModelSerializer):
    mltc = serializers.SlugRelatedField(queryset=MLTC.objects.all(), slug_field='name')
    services = serializers.SerializerMethodField()

    class Meta:
        model = Authorization
        exclude = ['created_at', 'updated_at']

    def get_services(self, obj):
        service_types = [AuthorizationService.SDC, AuthorizationService.TRANSPORTATION]
        existing_services = {s.service_type: s for s in obj.services.all()}
        result = []

        for stype in service_types:
            service = existing_services.get(stype)
            if service:
                result.append(AuthorizationServiceSerializer(service).data)
            else:
                result.append({
                    "service_type": stype,
                    "auth_id": "",
                    "service_code": "",
                    "service_units": ""
                })

        return result

class EnrollmentSerializer(MemberNameSerializer):
    old_mltc = serializers.SlugRelatedField(
        slug_field='name',
        queryset=MLTC.objects.all(),
        allow_null=True,
        required=False
    )
    new_mltc = serializers.SlugRelatedField(
        slug_field='name',
        queryset=MLTC.objects.all(),
        allow_null=True,
        required=False
    )

    class Meta:
        model = Enrollment
        exclude = ['created_at']