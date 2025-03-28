from django.db import models

class Diagnosis(models.Model):
    dx_code = models.CharField(max_length=255, null=False, blank=False)

    def __str__(self):
        return self.dx_code

class Authorization(models.Model):
    STATUS_CHOICES = [
        ('expired', 'Expired'),
        ('active', 'Active'),
        ('future', 'Future'),
    ]

    mltc_auth_id = models.CharField(max_length=255, null=False, blank=False)
    mltc_member_id = models.CharField(max_length=255, null=False, blank=False)
    member = models.ForeignKey('Member', null=True, blank=False, on_delete=models.SET_NULL)
    mltc = models.ForeignKey('MLTC', null=True, blank=False, on_delete=models.SET_NULL)
    schedule = models.CharField(max_length=255, null=False, blank=False)
    diagnosis = models.ForeignKey('Diagnosis', null=True, blank=False, on_delete=models.SET_NULL)
    social_day_care = models.BooleanField(default=True, null=False, blank=False)
    social_day_care_code = models.CharField(max_length=255, null=True, blank=True)
    transportation = models.BooleanField(default=True, null=False, blank=False)
    transportation_code = models.CharField(max_length=255, null=True, blank=True)
    start_date = models.DateField(null=False, blank=False)
    end_date = models.DateField(null=False, blank=False)
    status = models.CharField(max_length=7, choices=STATUS_CHOICES, default='active', null=False, blank=False)
    created_at = models.DateTimeField(auto_now_add=True, null=False)
    updated_at = models.DateTimeField(auto_now=True, null=False)

    def __str__(self):
        return f"{self.mltc} {self.mltc_auth_id}"