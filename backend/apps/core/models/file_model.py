from django.db import models

class File(models.Model):
    member = models.ForeignKey('Member', on_delete=models.CASCADE, related_name='files')
    name = models.CharField(max_length=50) 
    date = models.DateField()
    file = models.URLField()
    created_at = models.DateTimeField(auto_now_add=True, null=False)
    updated_at = models.DateTimeField(auto_now=True, null=False)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"File: {self.name}"