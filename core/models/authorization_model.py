from django.db import models

class Diagnosis(models.Model):
    dx_code = models.CharField(max_length=255, null=False, blank=False)

    def __str__(self):
        return self.dx_code

class Authorization(models.Model):
    auth_id = models.CharField(max_length=255, null=False, blank=False)
    insurance_member_id = models.CharField(max_length=255, null=False, blank=False)
    member = models.ForeignKey('Member', null=True, blank=False, on_delete=models.SET_NULL)
    mltc = models.ForeignKey('MLTC', null=True, blank=False, on_delete=models.SET_NULL)
    schedule = models.CharField(max_length=255, null=False, blank=False)
    diagnosis = models.ForeignKey('Diagnosis', null=True, blank=False, on_delete=models.SET_NULL)
    transportation = models.BooleanField(default=True, null=False, blank=False)
    start_date = models.DateField(null=False, blank=False)
    end_date = models.DateField(null=False, blank=False)
    created_at = models.DateTimeField(auto_now_add=True, null=False)
    updated_at = models.DateTimeField(auto_now=True, null=False)

    def __str__(self):
        return self.auth_id