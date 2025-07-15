from django.db import models

class Snapshot(models.Model):
    MEMBERS = 'members'
    BIRTHDAYS = 'birthdays'
    ABSENCES = 'absences'
    ASSESSMENTS = 'assessments'
    ENROLLMENTS = 'enrollments'

    SNAPSHOT_TYPES = [
        (MEMBERS, 'Members'),
        (BIRTHDAYS, 'Birthdays'),
        (ABSENCES, 'Absences'),
        (ASSESSMENTS, 'Assessments'),
        (ENROLLMENTS, 'Enrollments'),
    ]

    sadc = models.ForeignKey('Sadc', on_delete=models.CASCADE)
    date = models.DateField()
    type = models.CharField(max_length=20, choices=SNAPSHOT_TYPES)
    file = models.URLField()
    name = models.CharField(max_length=50)
    pages = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('sadc', 'date', 'type')
        ordering = ['-date']
        
    def __str__(self):
        return f"{self.sadc} - {self.type} - {self.date}"