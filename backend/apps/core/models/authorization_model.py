from django.db import models
from ...tenant.models.mltc_model import Mltc

class Authorization(models.Model):
    mltc = models.ForeignKey(Mltc, null=True, blank=False, on_delete=models.SET_NULL)
    member = models.ForeignKey('Member', null=True, blank=False, on_delete=models.SET_NULL)
    mltc_member_id = models.CharField(max_length=50, null=False, blank=False)
    start_date = models.DateField(null=False, blank=False)
    end_date = models.DateField(null=False, blank=False)
    dx_code = models.CharField(max_length=50, choices=[], null=True, blank=True)
    schedule = models.JSONField(default=list)
    cm_name = models.CharField(max_length=50, null=True, blank=True)
    cm_phone = models.CharField(max_length=10, null=True, blank=True)
    file = models.URLField(null=True, blank=True)

    active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, null=False)
    updated_at = models.DateTimeField(auto_now=True, null=False)

    class Meta:
        ordering = ['-start_date', '-end_date']

    def __str__(self):
        start = self.start_date.strftime('%m/%d/%Y')
        end = self.end_date.strftime('%m/%d/%Y')
        return f"{self.mltc}: {start} — {end}"

class AuthorizationService(models.Model):
    SDC = 'sdc'
    TRANSPORTATION = 'transportation'

    SERVICE_TYPES = [
        (SDC, 'SDC'),
        (TRANSPORTATION, 'Transportation'),
    ]

    authorization = models.ForeignKey('Authorization', related_name='services', on_delete=models.CASCADE)
    service_type = models.CharField(max_length=20, choices=SERVICE_TYPES)
    auth_id = models.CharField(max_length=255, null=True, blank=False)
    service_code = models.CharField(max_length=255, null=True, blank=True)
    service_units = models.IntegerField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True, null=False)
    updated_at = models.DateTimeField(auto_now=True, null=False)

    class Meta:
        unique_together = ('authorization', 'service_type')

    def __str__(self):
        return f"{self.service_type} for {self.authorization}"