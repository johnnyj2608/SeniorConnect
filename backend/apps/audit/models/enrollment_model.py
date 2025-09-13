from django.db import models
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
    member_id = models.PositiveIntegerField()
    member_name = models.CharField(max_length=50)
    member_alt_name = models.CharField(max_length=50, null=True, blank=True)

    old_mltc = models.CharField(max_length=50, null=True, blank=True)
    new_mltc = models.CharField(max_length=50, null=True, blank=True)

    change_type = models.CharField(max_length=20, choices=CHANGE_TYPES)
    change_date = models.DateField(default=datetime.date.today)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-change_date', '-created_at']
        verbose_name = "Enrollment"
        verbose_name_plural = "Enrollments"

    def __str__(self):
        if self.change_type == self.ENROLLMENT:
            details = f"to {self.new_mltc}"
        elif self.change_type == self.DISENROLLMENT:
            details = f"from {self.old_mltc}"
        else:
            details = f"from {self.old_mltc} to {self.new_mltc}"

        return f"{self.get_change_type_display()} {details} on {self.change_date.strftime('%m/%d/%Y')}"