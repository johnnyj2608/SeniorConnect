from rest_framework import serializers
from ..models.audit_model import AuditLog
from backend.apps.core.serializers.member_serializers import MemberNameSerializer

class AuditLogSerializer(MemberNameSerializer):
    user_name = serializers.ReadOnlyField(source='user.name')
    model_name = serializers.ReadOnlyField(source='content_type.model')

    class Meta:
        model = AuditLog
        exclude = ['user', 'content_type', 'object_id']