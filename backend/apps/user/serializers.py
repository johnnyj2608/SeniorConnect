from rest_framework import serializers
from .models import User
from ..tenant.models.mltc_model import MLTC

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            'id',
            'name',
            'email',
            'preferences',
            'view_snapshots',
            'allowed_mltcs',
            'password',
            'is_org_admin',
            'is_active',
        ]
    
    def create(self, validated_data):
        request = self.context.get('request')
        allowed_mltcs = validated_data.pop('allowed_mltcs', [])

        validated_data['preferences'] = {
            'dark_mode': False,
            'alt_name': False,
            'language': 'en'
        }

        if validated_data.get('is_org_admin'):
            validated_data['view_snapshots'] = True

        if request and hasattr(request.user, 'sadc'):
            validated_data['sadc'] = request.user.sadc

        user = super().create(validated_data)

        if validated_data.get('is_org_admin'):
            user.allowed_mltcs.set(MLTC.objects.all())  # Admins get all MLTCs
        else:
            user.allowed_mltcs.set(allowed_mltcs)

        if 'password' in validated_data:
            user.set_password(validated_data['password'])
            user.save()

        return user

    def update(self, instance, validated_data):
        validated_data.pop('sadc', None)
        password = validated_data.pop('password', None)
        allowed_mltcs = validated_data.pop('allowed_mltcs', None)

        if instance.is_org_admin or validated_data.get('is_org_admin'):
            validated_data['view_snapshots'] = True

        user = super().update(instance, validated_data)

        if instance.is_org_admin:
            user.allowed_mltcs.set(MLTC.objects.all())  # Admins always get all MLTCs
        elif allowed_mltcs is not None:
            user.allowed_mltcs.set(allowed_mltcs)

        if password:
            user.set_password(password)
            user.save()

        return user
    
    def validate_email(self, value):
        if self.instance and self.instance.is_org_admin:
            if value != self.instance.email:
                raise serializers.ValidationError("Cannot change email for admin users.")
        return value