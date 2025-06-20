from django.db import models

class Language(models.Model):
    sadc = models.ForeignKey('Sadc', on_delete=models.CASCADE, related_name='languages')
    name = models.CharField(max_length=255, null=False, blank=False)

    class Meta:
        unique_together = ('sadc', 'name')

    def __str__(self):
        return self.name