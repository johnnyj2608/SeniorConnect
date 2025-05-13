from django.db import models
import os
from django.utils.text import slugify

def member_file_path(instance, filename):
    """Generate file path using member id and file name."""
    ext = filename.split('.')[-1]
    member_id = instance.member.id
    filename = f"{slugify(instance.name)}.{ext}"

    return os.path.join(str(member_id), filename)

class File(models.Model):
    member = models.ForeignKey('Member', on_delete=models.CASCADE, related_name='files')
    name = models.CharField(max_length=100) 
    file = models.URLField()
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completion_date = models.DateField(null=True, blank=True)
    expiration_date = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.member})"