from django.db import models
from django.core.exceptions import ValidationError

class Contact(models.Model):
    
    EMERGENCY = 'emergency_contact'
    PRIMARY_PROVIDER = 'primary_care_provider'
    PHARMACY = 'pharmacy'
    HOME_AID = 'home_aid'
    HOME_CARE = 'home_care'
    OTHER = 'other'

    CONTACT_TYPES = [
        (EMERGENCY, 'Emergency Contact'),
        (PRIMARY_PROVIDER, 'Primary Care Provider'),
        (PHARMACY, 'Pharmacy'),
        (HOME_AID, 'Home Aid'),
        (HOME_CARE, 'Home Care'),
        (OTHER, 'Other'),
    ]

    HUSBAND = 'husband'
    WIFE = 'wife'
    SON = 'son'
    DAUGHTER = 'daughter'
    BROTHER = 'brother'
    SISTER = 'sister'
    FRIEND = 'friend'
    FATHER = 'father'
    MOTHER = 'mother'

    RELATIONSHIP_TYPES = [
        (HUSBAND, 'Husband'),
        (WIFE, 'Wife'),
        (SON, 'Son'),
        (DAUGHTER, 'Daughter'),
        (BROTHER, 'Brother'),
        (SISTER, 'Sister'),
        (FRIEND, 'Friend'),
        (FATHER, 'Father'),
        (MOTHER, 'Mother'),
        (OTHER, 'Other'),
    ]

    members = models.ManyToManyField('Member', related_name='contacts')
    contact_type = models.CharField(max_length=30, choices=CONTACT_TYPES)
    name = models.CharField(max_length=50)
    phone = models.CharField(max_length=10)
    relationship_type = models.CharField(
        max_length=20,
        choices=RELATIONSHIP_TYPES,
        null=True,
        blank=True,
        help_text="Only used if this if contact type is emergency"
    )
    created_at = models.DateTimeField(auto_now_add=True, null=False)
    updated_at = models.DateTimeField(auto_now=True, null=False)

    class Meta:
        ordering = ['contact_type']

    def clean(self):
        if self.contact_type == self.EMERGENCY and not self.relationship_type:
            raise ValidationError("relationship_type must be set for emergency contacts.")
        
        if self.contact_type != self.EMERGENCY and self.relationship_type:
            raise ValidationError("relationship_type can only be set for emergency contacts.")

    def __str__(self):
        return f"{self.contact_type}: {self.name}"