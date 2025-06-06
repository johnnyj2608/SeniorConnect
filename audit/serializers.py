from rest_framework import serializers
from .models import AuditLog

class AuditLogSerializer(serializers.ModelSerializer):
    member_name = serializers.SerializerMethodField()
    user_name = serializers.SerializerMethodField()
    model_name = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        exclude = ['user', 'content_type', 'object_id']

    def get_member_name(self, obj):
        member = obj.member
        if member:
            return f"{member.sadc_member_id}. {member.last_name}, {member.first_name}"
        return None

    def get_user_name(self, obj):
        user = obj.user

        if user:
            return user.name
        return None

    def get_model_name(self, obj):
        if obj.content_type:
            model = obj.content_type.model
            return model
        return None