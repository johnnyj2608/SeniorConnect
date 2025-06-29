from django.contrib import admin

# Register your models here.

from .models.audit_model import AuditLog
from .models.enrollment_model import Enrollment

admin.site.register(AuditLog)
admin.site.register(Enrollment)