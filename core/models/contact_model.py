from django.db import models
from django.core.exceptions import ValidationError

class Contact(models.Model):
    CONTACT_TYPE_CHOICES = [
        ('emergency', 'Emergency Contact'),
        ('primary_provider', 'Primary Care Provider'),
        ('pharmacy', 'Pharmacy'),
        ('home_aid', 'Home Aid'),
        ('home_care', 'Home Care'),
        ('other', 'Other'),
    ]

    RELATIONSHIP_TYPE_CHOICES = [
        ('husband', 'Husband'),
        ('wife', 'Wife'),
        ('son', 'Son'),
        ('daughter', 'Daughter'),
        ('brother', 'Brother'),
        ('sister', 'Sister'),
        ('friend', 'Friend'),
        ('father', 'Father'),
        ('mother', 'Mother'),
        ('other', 'Other'),
    ]

    members = models.ManyToManyField('Member', related_name='contacts')
    contact_type = models.CharField(max_length=20, choices=CONTACT_TYPE_CHOICES)
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=10)
    relationship_type = models.CharField(
        max_length=20,
        choices=RELATIONSHIP_TYPE_CHOICES,
        null=True,
        blank=True,
        help_text="Only used if this if contact type is emergency"
    )
    created_at = models.DateTimeField(auto_now_add=True, null=False)
    updated_at = models.DateTimeField(auto_now=True, null=False)

    class Meta:
        ordering = ['contact_type']

    def clean(self):
        if self.contact_type == 'emergency' and not self.relationship_type:
            raise ValidationError("relationship_type must be set for emergency contacts.")
        
        if self.contact_type != 'emergency' and self.relationship_type:
            raise ValidationError("relationship_type can only be set for emergency contacts.")

    def __str__(self):
        return f"{self.name} ({self.contact_type})"