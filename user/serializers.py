from rest_framework import serializers
from .models import StaffUser

class StaffUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffUser
        fields = '__all__'
        read_only_fields = ['id', 'is_staff', 'created_at', 'updated_at']