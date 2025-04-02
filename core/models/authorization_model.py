from django.db import models

class MLTC(models.Model):
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=10)

    def __str__(self):
        return self.name

class Diagnosis(models.Model):
    dx_code = models.CharField(max_length=255, null=False, blank=False)

    def __str__(self):
        return self.dx_code

class Authorization(models.Model):
    mltc_auth_id = models.CharField(max_length=255, null=False, blank=False)
    mltc_member_id = models.CharField(max_length=255, null=False, blank=False)
    mltc = models.ForeignKey('MLTC', null=True, blank=False, on_delete=models.SET_NULL)
    member_id = models.ForeignKey('Member', null=True, blank=False, on_delete=models.SET_NULL)
    schedule = models.JSONField(default=list)
    diagnosis = models.ForeignKey('Diagnosis', null=True, blank=False, on_delete=models.SET_NULL)
    sdc_code = models.CharField(max_length=255, null=True, blank=True)
    trans_code = models.CharField(max_length=255, null=True, blank=True)
    start_date = models.DateField(null=False, blank=False)
    end_date = models.DateField(null=False, blank=False)
    created_at = models.DateTimeField(auto_now_add=True, null=False)
    updated_at = models.DateTimeField(auto_now=True, null=False)

    def __str__(self):
        return f"{self.mltc_id.name} {self.mltc_auth_id}"