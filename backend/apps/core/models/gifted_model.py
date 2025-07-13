from django.db import models
from backend.apps.tenant.models.gift_model import Gift

class Gifted(models.Model):
    gift = models.ForeignKey(Gift, on_delete=models.CASCADE, related_name='gifted')
    member = models.ForeignKey('Member', on_delete=models.CASCADE, related_name='received_gifts')
    received_at = models.DateTimeField(auto_now_add=True)

    created_at = models.DateTimeField(auto_now_add=True, null=False)
    updated_at = models.DateTimeField(auto_now=True, null=False)

    class Meta:
        unique_together = ('gift', 'member')
        ordering = ['-received_at']

    def __str__(self):
        return f"{self.member.full_name} received {self.gift.name} on {self.received_at.date()}"