from django.db import models

class RelationshipType(models.Model):
    name = models.CharField(max_length=255, null=False, blank=False)

    def __str__(self):
        return self.name
    
class CareManager(models.Model):
    name = models.CharField(max_length=255, null=False, blank=False)
    phone = models.CharField(max_length=10, null=False, blank=False)
    mltc = models.ForeignKey('MLTC', null=True, blank=False, on_delete=models.SET_NULL)

    def __str__(self):
        return self.name
    
class MemberEmergencyContact(models.Model):
    member = models.ForeignKey('Member', null=False, on_delete=models.CASCADE)
    contact_name = models.CharField(max_length=255, null=False, blank=False)
    contact_phone = models.CharField(max_length=10, null=False, blank=False)
    relationship_type = models.ForeignKey('RelationshipType', null=True, blank=False, on_delete=models.SET_NULL)

    def __str__(self):
        return f"{self.contact_name} ({self.relationship_type.name})"

class PrimaryCareProvider(models.Model):
    name = models.CharField(max_length=255, null=False, blank=False)
    phone = models.CharField(max_length=10, null=False, blank=False)

    def __str__(self):
        return self.name

class Pharmacy(models.Model):
    name = models.CharField(max_length=255, null=False, blank=False)
    phone = models.CharField(max_length=10, null=False, blank=False)

    def __str__(self):
        return self.name