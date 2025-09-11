from django.db import models

class File(models.Model):
    member = models.ForeignKey('Member', on_delete=models.CASCADE, related_name='files')
    name = models.CharField(max_length=50) 
    date = models.DateField()
    file = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=False)
    updated_at = models.DateTimeField(auto_now=True, null=False)

    class Meta:
        ordering = ['name']
        verbose_name = "File"
        verbose_name_plural = "Files"

    def __str__(self):
        return f"File: {self.name}"