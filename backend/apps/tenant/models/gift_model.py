from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError

class Gift(models.Model):
    name = models.CharField(max_length=50)
    sadc = models.ForeignKey('Sadc', on_delete=models.CASCADE, related_name='gifts')
    mltc = models.ForeignKey('Mltc', on_delete=models.CASCADE, related_name='gifts', null=True, blank=True)
    birth_month = models.PositiveSmallIntegerField(null=True, blank=True)  # 1=Jan, 12=Dec
    expires_at = models.DateField(null=True, blank=True)
    expires_delete = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True, null=False)
    updated_at = models.DateTimeField(auto_now=True, null=False)

    class Meta:
        ordering = ['expires_at', 'created_at']
        verbose_name = "Gift"
        verbose_name_plural = "Gifts"

    def __str__(self):
        return f"{self.name} ({self.mltc.name if self.mltc else 'All MLTCs'})"

    def is_expired(self):
        return self.expires_at and timezone.now().date() > self.expires_at

    def clean(self):
        if self.expires_at is None and self.expires_delete:
            raise ValidationError("expires_delete must be False if expires_at is null.")