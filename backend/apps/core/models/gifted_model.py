from django.db import models
from backend.apps.tenant.models.gift_model import Gift

class Gifted(models.Model):
    gift = models.ForeignKey(Gift, on_delete=models.CASCADE, related_name='gifted')
    member = models.ForeignKey('Member', on_delete=models.CASCADE, related_name='received_gifts')
    received_at = models.DateTimeField(null=True, blank=True)
    note = models.CharField(max_length=220, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True, null=False)
    updated_at = models.DateTimeField(auto_now=True, null=False)

    class Meta:
        unique_together = ('gift', 'member')
        ordering = ['-received_at']
        verbose_name = "Gifted"
        verbose_name_plural = "Gifted"

    def __str__(self):
        received_at_str = self.received_at.date() if self.received_at else "N/A"
        return f"{self.member.full_name} received {self.gift.name} on {received_at_str}"