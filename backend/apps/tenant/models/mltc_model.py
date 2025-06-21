from django.db import models

class Mltc(models.Model):
    sadc = models.ForeignKey('Sadc', on_delete=models.CASCADE, related_name='mltcs')
    name = models.CharField(max_length=255, unique=True)
    dx_codes = models.JSONField(default=list)

    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['active',  'name']
        unique_together = ('sadc', 'name')

    def __str__(self):
        return self.name