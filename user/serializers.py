from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    is_admin_user = serializers.SerializerMethodField()
    is_staff_user = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = '__all__'
        read_only_fields = [
            'id', 
            'is_staff', 
            'created_at', 
            'updated_at', 
            'sadc',
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['role_type'] = instance.get_role_type_display()
        return data

    def get_is_admin_user(self, obj):
        return obj.role_type == 'admin'

    def get_is_staff_user(self, obj):
        return obj.role_type == 'staff'
    
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