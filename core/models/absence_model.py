from django.db import models

class Absence(models.Model):
    VACATION = 'vacation'
    HOSPITAL = 'hospital'
    PERSONAL = 'personal'
    OTHER = 'other'

    ABSENCE_TYPES = [
        (VACATION, 'Vacation'),
        (HOSPITAL, 'Hospital'),
        (PERSONAL, 'Personal'),
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
    note = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_date', '-end_date']

    def __str__(self):
        start = self.start_date.strftime('%m/%d/%Y') if self.start_date else ''
        end = f" to {self.end_date.strftime('%m/%d/%Y')}" if self.end_date else ''
        return f"{self.get_absence_type_display()} from {start}{end}"