from rest_framework import serializers
from .models import AuditLog

class AuditLogSerializer(serializers.ModelSerializer):
    member_name = serializers.SerializerMethodField()
    user_name = serializers.SerializerMethodField()
    model_name = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        exclude = ['user', 'content_type', 'object_id', 'object_display']

    def to_representation(self, instance):
        data = super().to_representation(instance)

        changes = data.get('changes')
        if changes and isinstance(changes, dict):
            lines = []
            if instance.object_display: lines.append(instance.object_display)
            for field, change in changes.items():
                formatted_field = ' '.join(word.capitalize() for word in field.split('_'))
                old = change.get('old')
                new = change.get('new')
                lines.append(f"• {formatted_field}: {old} → {new}")
            data['changes'] = '\n'.join(lines)
        else:
            data['changes'] = ''

        return data

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
            return model.capitalize()
        return None