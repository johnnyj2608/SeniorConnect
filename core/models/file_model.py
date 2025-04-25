from django.db import models
from datetime import date
import os
from django.utils.text import slugify

def member_file_path(instance, filename):
    """Generate file path using tab name and upload date in M_D_Y format."""
    ext = filename.split('.')[-1]
    tab_name = slugify(instance.tab.name)

    today = date.today()
    month = today.month
    day = today.day
    year = today.strftime('%y')
    date_str = f"{month}_{day}_{year}"

    filename = f"{tab_name}_{date_str}.{ext}"
    return os.path.join(f"{instance.tab.member.id}/", filename)

class FileTab(models.Model):
    member = models.ForeignKey('Member', on_delete=models.CASCADE, related_name='file_tabs')
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('member', 'name')
        ordering = ['name'] 
        
    def __str__(self):
        return f"{self.name} ({self.member})"
    
class FileVersion(models.Model):
    tab = models.ForeignKey(FileTab, on_delete=models.CASCADE, related_name='versions')
    file = models.FileField(upload_to=member_file_path)
    completion_date = models.DateField(null=True, blank=True)
    expiration_date = models.DateField(null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-completion_date', '-uploaded_at']

    def __str__(self):
        return f"{self.tab.name} - {self.file}"