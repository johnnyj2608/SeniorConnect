from django.db import models
from django.conf import settings

class Absence(models.Model):
    VACATION = 'vacation'
    HOSPITAL = 'hospital'
    PERSONAL = 'personal'
    ASSESSMENT = 'assessment'
    OTHER = 'other'

    ABSENCE_TYPES = [
        (VACATION, 'Vacation'),
        (HOSPITAL, 'Hospital'),
        (PERSONAL, 'Personal'),
        (ASSESSMENT, 'Assessment'),
        (OTHER, 'Other'),
    ]

    member = models.ForeignKey(
        'Member',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='absences'
    )
    absence_type = models.CharField(max_length=20, choices=ABSENCE_TYPES)
    start_date = models.DateField(null=False, blank=False)
    end_date = models.DateField(null=True, blank=True)
    called = models.BooleanField(default=False)
    note = models.CharField(max_length=220, blank=True, null=True)
    file = models.URLField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_date', '-end_date']
        verbose_name = "Absence"
        verbose_name_plural = "Absences"

    def __str__(self):
        start = self.start_date.strftime('%m/%d/%Y') if self.start_date else ''
        end = f" — {self.end_date.strftime('%m/%d/%Y')}" if self.end_date else ''
        return f"{self.absence_type}: {start}{end}"

class Assessment(Absence):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assessments'
    )
    time = models.TimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Assessment"
        verbose_name_plural = "Assessments"