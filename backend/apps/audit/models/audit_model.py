from django.db import models
from django.core.serializers.json import DjangoJSONEncoder
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey

class AuditLog(models.Model):
    
    CREATE = 'create'
    UPDATE = 'update'
    DELETE = 'delete'

    ACTION_TYPES = (
        (CREATE, 'Create'),
        (UPDATE, 'Update'),
        (DELETE, 'Delete'),
    )

    user_id = models.PositiveIntegerField()
    user_name = models.CharField(max_length=50)

    member_id = models.PositiveIntegerField()
    member_name = models.CharField(max_length=50)
    member_alt_name = models.CharField(max_length=50, null=True, blank=True)

    object_id = models.PositiveIntegerField()
    object_name = models.CharField(max_length=50)

    action_type = models.CharField(max_length=20, choices=ACTION_TYPES)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    
    content_object = GenericForeignKey('content_type', 'object_id')
    timestamp = models.DateTimeField(auto_now_add=True)
    changes = models.JSONField(null=True, blank=True, encoder=DjangoJSONEncoder)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = "Audit Log"
        verbose_name_plural = "Audit Logs"

    def __str__(self):
        return f"{self.timestamp} - {self.user_name} - {self.get_action_type_display()} {self.content_type} #{self.object_id}"