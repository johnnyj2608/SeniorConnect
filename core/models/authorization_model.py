from django.db import models

class MLTC(models.Model):
    name = models.CharField(max_length=255)
    dx_codes = models.JSONField(default=list)

    def __str__(self):
        return self.name

class Authorization(models.Model):
    mltc_auth_id = models.CharField(max_length=255, null=False, blank=False)
    mltc_member_id = models.CharField(max_length=255, null=False, blank=False)
    mltc = models.ForeignKey('MLTC', null=True, blank=False, on_delete=models.SET_NULL)
    member = models.ForeignKey('Member', null=True, blank=False, on_delete=models.SET_NULL)
    schedule = models.JSONField(default=list)
    dx_code = models.CharField(max_length=255, choices=[], null=True, blank=True)
    sdc_code = models.CharField(max_length=255, null=True, blank=True)
    trans_code = models.CharField(max_length=255, null=True, blank=True)
    start_date = models.DateField(null=False, blank=False)
    end_date = models.DateField(null=False, blank=False)
    active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, null=False)
    updated_at = models.DateTimeField(auto_now=True, null=False)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.mltc}: {self.mltc_auth_id}"