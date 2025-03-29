from django.db import models

class Diagnosis(models.Model):
    dx_code = models.CharField(max_length=255, null=False, blank=False)

    def __str__(self):
        return self.dx_code

class Authorization(models.Model):
    mltc_auth_id = models.CharField(max_length=255, null=False, blank=False)
    mltc_member_id = models.CharField(max_length=255, null=False, blank=False)
    mltc_id = models.ForeignKey('MLTC', null=True, blank=False, on_delete=models.SET_NULL)
    member_id = models.ForeignKey('Member', null=True, blank=False, on_delete=models.SET_NULL)
    monday = models.BooleanField(default=False)
    tuesday = models.BooleanField(default=False)
    wednesday = models.BooleanField(default=False)
    thursday = models.BooleanField(default=False)
    friday = models.BooleanField(default=False)
    saturday = models.BooleanField(default=False)
    sunday = models.BooleanField(default=False)
    diagnosis = models.ForeignKey('Diagnosis', null=True, blank=False, on_delete=models.SET_NULL)
    social_day_care_code = models.CharField(max_length=255, null=True, blank=True)
    transportation_code = models.CharField(max_length=255, null=True, blank=True)
    start_date = models.DateField(null=False, blank=False)
    end_date = models.DateField(null=False, blank=False)
    created_at = models.DateTimeField(auto_now_add=True, null=False)
    updated_at = models.DateTimeField(auto_now=True, null=False)

    def __str__(self):
        return f"{self.mltc} {self.mltc_auth_id}"