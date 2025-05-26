from rest_framework import serializers
from .models import AuditLog
from core.models.member_model import Member

class AuditLogSerializer(serializers.ModelSerializer):
    member_name = serializers.SerializerMethodField()
    user_name = serializers.SerializerMethodField()
    model_name = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = '__all__'

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['action_type'] = instance.get_action_type_display()
        return data
    
    def get_member(self, obj):
        related_obj = obj.content_object

        if isinstance(related_obj, Member):
            return related_obj

        if hasattr(related_obj, 'member') and related_obj.member:
            return related_obj.member

        return None

    def get_member_name(self, obj):
        member = self.get_member(obj)
        if member:
            return f"{member.sadc_member_id}. {member.first_name} {member.last_name}"
        return None
    
    def get_user_name(self, obj):
        if obj.user:
            return obj.user.name
        return None
    
    def get_model_name(self, obj):
        if obj.content_type:
            return obj.content_type.model_class().__name__
        return None