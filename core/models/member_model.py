from django.db import models
import os
from django.utils.text import slugify

def member_photo_path(instance, filename):
    """Generate file path for new member photo, overwriting existing one."""
    ext = filename.split('.')[-1]
    filename = f"{instance.first_name}_{instance.last_name}_profile.{ext}"
    name = f"{slugify(instance.first_name)}_{slugify(instance.last_name)}_profile.{ext}"
    return os.path.join(str(instance.id), name)

class Language(models.Model):
    name = models.CharField(max_length=255, null=False, blank=False)

    def __str__(self):
        return self.name

class Member(models.Model):
    sadc_member_id = models.IntegerField(null=False, blank=False)
    photo = models.URLField(null=True, blank=True)
    first_name = models.CharField(max_length=255, null=False, blank=False)
    last_name = models.CharField(max_length=255, null=False, blank=False)
    alt_name = models.CharField(max_length=255, null=True, blank=True)
    birth_date = models.DateField(null=False, blank=False)
    gender = models.CharField(max_length=1, choices=[('M', 'Male'), ('F', 'Female')], null=False, blank=False)
    address = models.CharField(max_length=255, null=True, blank=True)
    phone = models.CharField(max_length=10, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    medicaid = models.CharField(max_length=8, null=True, blank=True)
    ssn = models.CharField(max_length=9, null=True, blank=True)
    language = models.ForeignKey('Language', null=True, blank=True, on_delete=models.SET_NULL)
    enrollment_date = models.DateField(null=True, blank=True) 
    note = models.TextField(null=True, blank=True)
    active_auth = models.OneToOneField(
        'Authorization',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='active_for_member'
    )
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=False)
    updated_at = models.DateTimeField(auto_now=True, null=False)

    class Meta:
        ordering = ['sadc_member_id']

    def __str__(self):
        return f"{self.sadc_member_id}. {self.first_name} {self.last_name}"