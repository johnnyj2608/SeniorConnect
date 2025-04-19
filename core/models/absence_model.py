from django.db import models

class Absence(models.Model):
    ABSENCE_TYPES = [
        ('vacation', 'Vacation'),
        ('hospital', 'Hospital'),
        ('personal', 'Personal'),
        ('other', 'Other'),
    ]

    member = models.ForeignKey('Member', on_delete=models.CASCADE, related_name='absences')
    absence_type = models.CharField(max_length=20, choices=ABSENCE_TYPES)
    start_date = models.DateField(null=False, blank=False)
    end_date = models.DateField(null=True, blank=True)
    note = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.member} - {self.absence_type} from {self.start_date} to {self.end_date}"
