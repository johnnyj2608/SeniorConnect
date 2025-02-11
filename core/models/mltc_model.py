from django.db import models

class MLTC(models.Model):
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=10)

    def __str__(self):
        return self.name