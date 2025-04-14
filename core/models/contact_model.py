from django.db import models
from django.core.exceptions import ValidationError

class Contact(models.Model):
    CONTACT_TYPE_CHOICES = [
        ('emergency', 'Emergency Contact'),
        ('home_aid', 'Home Aid'),
        ('primary_provider', 'Primary Care Provider'),
        ('pharmacy', 'Pharmacy'),
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

    member = models.ForeignKey('Member', on_delete=models.CASCADE)
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
    related_member = models.ForeignKey(
        'Member',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='related_contacts',
        help_text="Only used if this contact is also a member (e.g. spouse)"
    )

    def clean(self):
        if self.contact_type == 'emergency' and not self.relationship_type:
            raise ValidationError("relationship_type must be set for emergency contacts.")
        
        if self.contact_type != 'emergency' and self.relationship_type:
            raise ValidationError("relationship_type can only be set for emergency contacts.")
        
        if self.related_member and self.relationship_type not in ['husband', 'wife']:
            raise ValidationError("related_member can only be set if the relationship_type is 'husband' or 'wife'.")

    def __str__(self):
        return f"{self.name} ({self.contact_type})"