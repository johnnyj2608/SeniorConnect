from django.db import models

class Member(models.Model):

    # Details
    sadc_member_id = models.IntegerField(null=False, blank=False)
    mltc = models.ForeignKey('MLTC', null=True, blank=False, on_delete=models.SET_NULL)
    photo = models.BinaryField(null=True, blank=True)
    first_name = models.CharField(max_length=255, null=False, blank=False)
    last_name = models.CharField(max_length=255, null=False, blank=False)
    birth_date = models.DateField(null=False, blank=False)
    gender = models.CharField(max_length=1, choices=[('M', 'Male'), ('F', 'Female')], null=False, blank=False)
    address = models.ForeignKey('Address', null=True, blank=True, on_delete=models.SET_NULL)
    phone = models.CharField(max_length=10, null=False, blank=False)
    email = models.EmailField(null=False, blank=True)
    medicaid = models.CharField(max_length=8, null=False, blank=False)

    # Relationships
    care_manager = models.ForeignKey('CareManager', null=True, blank=True, on_delete=models.SET_NULL)
    primary_care_provider = models.ForeignKey('PrimaryCareProvider', null=True, blank=True, on_delete=models.SET_NULL)
    pharmacy = models.ForeignKey('Pharmacy', null=True, blank=True, on_delete=models.SET_NULL)
    spouse = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL)

    # Status
    active = models.BooleanField(null=False, blank=False, default=True)
    updated = models.DateTimeField(auto_now=True)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['sadc_member_id', 'mltc'], name='unique_member')
        ]

    def __str__(self):
        return f"{self.first_name} {self.last_name}"