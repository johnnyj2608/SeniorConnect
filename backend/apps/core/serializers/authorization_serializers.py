from rest_framework import serializers
from ..models.authorization_model import Authorization, AuthorizationService
from backend.apps.tenant.models.mltc_model import Mltc
from .mixins import DateRangeValidationMixin

class AuthorizationServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuthorizationService
        exclude = ['created_at', 'updated_at']

class AuthorizationSerializer(serializers.ModelSerializer, DateRangeValidationMixin):
    mltc = serializers.SlugRelatedField(
        queryset=Mltc.objects.all(),
        slug_field='name'
    )

    class Meta:
        model = Authorization
        exclude = ['created_at', 'updated_at']

    def validate(self, attrs):
        mltc = attrs.get('mltc')
        dx_code = attrs.get('dx_code')

        if dx_code and mltc:
            valid_codes = getattr(mltc, 'dx_codes', [])
            if dx_code not in valid_codes:
                attrs['dx_code'] = None

        return attrs

class AuthorizationWithServiceSerializer(serializers.ModelSerializer):
    mltc = serializers.SlugRelatedField(
        queryset=Mltc.objects.all(),
        slug_field='name'
    )
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