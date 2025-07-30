from django.db import models

class Gifted(models.Model):
    member = models.ForeignKey('Member', on_delete=models.CASCADE, related_name='received_gifts')
    gift_id = models.IntegerField(null=False, blank=False)
    gift_name = models.CharField(max_length=220, blank=False, null=False)
    received = models.BooleanField(default=False)
    note = models.CharField(max_length=220, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True, null=False)
    updated_at = models.DateTimeField(auto_now=True, null=False)

    class Meta:
        unique_together = ('gift_id', 'member')
        ordering = ['-created_at']
        verbose_name = "Gifted"
        verbose_name_plural = "Gifted"

    def __str__(self):
        return f"{self.member.full_name} received {self.gift_name}"