from django.db import models

def default_language():
    return ["English"]

class Sadc(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(null=False, blank=False)
    phone = models.CharField(max_length=20, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    npi = models.CharField(max_length=10, null=True, blank=True, unique=True, help_text="National Provider Identifier")
    attendance_template = models.PositiveSmallIntegerField(default=1) 
    language = models.JSONField(default=default_language)

    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name