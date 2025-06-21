from django.db import models
from ...tenant.models.mltc_model import Mltc
import datetime

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
        Mltc,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='new_enrollments'
    )
    
    old_mltc = models.ForeignKey(
        Mltc,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='old_enrollments'
    )
    change_date = models.DateField(default=datetime.date.today)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-change_date', '-created_at']

    def __str__(self):
        if self.change_type == self.ENROLLMENT:
            details = f"to {self.new_mltc}"
        elif self.change_type == self.DISENROLLMENT:
            details = f"from {self.old_mltc}"
        else:
            details = f"from {self.old_mltc} to {self.new_mltc}"

        return f"{self.get_change_type_display()} {details} on {self.change_date.strftime('%m/%d/%Y')}"