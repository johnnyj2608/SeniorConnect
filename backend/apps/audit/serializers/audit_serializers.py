from rest_framework import serializers
from ..models.audit_model import AuditLog

class AuditLogSerializer(serializers.ModelSerializer):
    model_name = serializers.ReadOnlyField(source='content_type.model')

    class Meta:
        model = AuditLog
        exclude = ['user_id', 'content_type', 'object_id']