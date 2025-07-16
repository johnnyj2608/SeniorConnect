from django.db import models
from django.core.serializers.json import DjangoJSONEncoder
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.conf import settings
from backend.apps.core.models.member_model import Member

class AuditLog(models.Model):
    
    CREATE = 'create'
    UPDATE = 'update'
    DELETE = 'delete'

    ACTION_TYPES = (
        (CREATE, 'Create'),
        (UPDATE, 'Update'),
        (DELETE, 'Delete'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    action_type = models.CharField(max_length=20, choices=ACTION_TYPES)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    timestamp = models.DateTimeField(auto_now_add=True)
    changes = models.JSONField(null=True, blank=True, encoder=DjangoJSONEncoder)
    member = models.ForeignKey(Member, null=True, blank=True, on_delete=models.SET_NULL, related_name='audit_logs')
    object_display = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        ordering = ['-timestamp']
        verbose_name = "Audit Log"
        verbose_name_plural = "Audit Logs"

    def __str__(self):
        return f"{self.timestamp} - {self.user} - {self.get_action_type_display()} {self.content_type} #{self.object_id}"