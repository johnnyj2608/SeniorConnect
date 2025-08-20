from rest_framework import serializers
from .models import User
from ..tenant.models.mltc_model import Mltc

class UserReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'name',
            'email',
            'preferences',
            'view_snapshots',
            'allowed_mltcs',
            'is_org_admin',
            'is_active',
        ]

class UserWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'name',
            'email',
            'preferences',
            'view_snapshots',
            'allowed_mltcs',
            'is_org_admin',
            'is_active',
        ]

    def create(self, validated_data):
        request = self.context.get('request')
        allowed_mltcs = validated_data.pop('allowed_mltcs', [])
        
        if request and hasattr(request.user, 'sadc'):
            validated_data['sadc'] = request.user.sadc

        user = super().create(validated_data)

        if user.is_org_admin:
            user.allowed_mltcs.set(Mltc.objects.all())
        else:
            user.allowed_mltcs.set(allowed_mltcs)

        user.set_unusable_password()  # No password yet
        user.save()
        return user

    def update(self, instance, validated_data):
        allowed_mltcs = validated_data.pop('allowed_mltcs', None)
        user = super().update(instance, validated_data)
        
        if instance.is_org_admin:
            user.allowed_mltcs.set(Mltc.objects.all())
        elif allowed_mltcs is not None:
            user.allowed_mltcs.set(allowed_mltcs)
        user.save()
        return user

class PasswordSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True, required=True)