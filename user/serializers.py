from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            'id',
            'name',
            'email',
            'preferences',
            'password',
            'is_org_admin',
            'is_active',
        ]
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request.user, 'sadc'):
            validated_data['sadc'] = request.user.sadc
        user = super().create(validated_data)
        if 'password' in validated_data:
            user.set_password(validated_data['password'])
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user
    
    def validate_email(self, value):
        if self.instance and self.instance.is_org_admin:
            if value != self.instance.email:
                raise serializers.ValidationError("Cannot change email for admin users.")
        return value