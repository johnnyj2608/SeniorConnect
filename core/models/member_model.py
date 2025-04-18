from django.db import models
import os

def member_photo_path(instance, filename):
    """Generate file path for new member photo, overwriting existing one."""
    ext = filename.split('.')[-1]
    filename = f"{instance.id}.{ext}"
    return os.path.join('profile_pics/', filename)

class Language(models.Model):
    name = models.CharField(max_length=255, null=False, blank=False)

    def __str__(self):
        return self.name

class Member(models.Model):

    # Details
    sadc_member_id = models.IntegerField(null=False, blank=False)
    mltc_id = models.ForeignKey('MLTC', null=True, blank=False, on_delete=models.SET_NULL)
    photo = models.ImageField(upload_to=member_photo_path, null=True, blank=True)
    first_name = models.CharField(max_length=255, null=False, blank=False)
    last_name = models.CharField(max_length=255, null=False, blank=False)
    birth_date = models.DateField(null=False, blank=False)
    gender = models.CharField(max_length=1, choices=[('M', 'Male'), ('F', 'Female')], null=False, blank=False)
    address = models.ForeignKey('Address', null=True, blank=True, on_delete=models.SET_NULL)
    phone = models.CharField(max_length=10, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    medicaid = models.CharField(max_length=8, null=True, blank=True)
    ssn = models.CharField(max_length=9, null=True, blank=True)
    language = models.ForeignKey('Language', null=True, blank=True, on_delete=models.SET_NULL)
    enrollment_date = models.DateField(null=True, blank=True) 
    note = models.TextField(null=True, blank=True)

    # Status
    active = models.BooleanField(default=True)
    updated = models.DateTimeField(auto_now=True)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['sadc_member_id', 'mltc_id'], name='unique_member')
        ]

    def __str__(self):
        return f"{self.id} | {self.sadc_member_id}. {self.first_name} {self.last_name}"