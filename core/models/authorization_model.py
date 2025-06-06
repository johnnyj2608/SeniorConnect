from django.db import models
import datetime

class MLTC(models.Model):
    name = models.CharField(max_length=255, unique=True)
    dx_codes = models.JSONField(default=list)
    active = models.BooleanField(default=True)

    class Meta:
        ordering = ['active',  'name']

    def __str__(self):
        return self.name

class Authorization(models.Model):
    mltc = models.ForeignKey('MLTC', null=True, blank=False, on_delete=models.SET_NULL)
    member = models.ForeignKey('Member', null=True, blank=False, on_delete=models.SET_NULL)
    mltc_member_id = models.CharField(max_length=255, null=False, blank=False)
    start_date = models.DateField(null=False, blank=False)
    end_date = models.DateField(null=False, blank=False)
    dx_code = models.CharField(max_length=255, choices=[], null=True, blank=True)
    schedule = models.JSONField(default=list)

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
    service = models.CharField(max_length=20, choices=SERVICE_TYPES)
    auth_id = models.CharField(max_length=255, null=True, blank=False)
    service_code = models.CharField(max_length=255, null=True, blank=True)
    service_units = models.IntegerField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True, null=False)
    updated_at = models.DateTimeField(auto_now=True, null=False)

    class Meta:
        unique_together = ('authorization', 'service')

    def __str__(self):
        return f"{self.service} for {self.authorization}"

class Enrollment(models.Model):
    ENROLLMENT = 'enrollment'
    TRANSFER = 'transfer'
    DISENROLLMENT = 'disenrollment'

    CHANGE_TYPES = [
        (ENROLLMENT, 'Enrollment'),
        (TRANSFER, 'Transfer'),
        (DISENROLLMENT, 'Disenrollment'),
    ]
    member = models.ForeignKey('Member', null=True, on_delete=models.SET_NULL)
    change_type = models.CharField(max_length=20, choices=CHANGE_TYPES)
    new_mltc = models.ForeignKey(
        MLTC,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='new_enrollments'
    )
    
    old_mltc = models.ForeignKey(
        MLTC,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='old_enrollments'
    )
    change_date = models.DateField(default=datetime.date.today)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-change_date']

    def __str__(self):
        if self.change_type == self.ENROLLMENT:
            details = f"to {self.new_mltc}"
        elif self.change_type == self.DISENROLLMENT:
            details = f"from {self.old_mltc}"
        else:
            details = f"from {self.old_mltc} to {self.new_mltc}"

        return f"{self.get_change_type_display()} {details} on {self.change_date.strftime('%m/%d/%Y')}"