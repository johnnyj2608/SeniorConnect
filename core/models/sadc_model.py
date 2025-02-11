from django.db import models

class SADC(models.Model):
    name = models.CharField(max_length=255, null=False, blank=False)
    address = models.ForeignKey('Address', null=True, blank=False, on_delete=models.SET_NULL)
    phone = models.CharField(max_length=10, null=False, blank=False)
    npi = models.CharField(max_length=10, null=False, blank=False)

    def __str__(self):
        return self.name