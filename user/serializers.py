from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
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
            'role'
        ]

    def get_is_admin_user(self, obj):
        return obj.role == 'admin'

    def get_is_staff_user(self, obj):
        return obj.role == 'staff'

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance