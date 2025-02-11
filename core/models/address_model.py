from django.db import models

class City(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name

class State(models.Model):
    name = models.CharField(max_length=2, unique=True)

    def __str__(self):
        return self.name
    
class ZipCode(models.Model):
    code = models.CharField(max_length=10, unique=True)

    def __str__(self):
        return self.code
    
class Address(models.Model):
    street_address = models.CharField(max_length=255)
    city = models.ForeignKey(City, on_delete=models.SET_NULL, null=True)
    state = models.ForeignKey(State, on_delete=models.SET_NULL, null=True)
    zip_code = models.ForeignKey(ZipCode, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f'{self.street_address}, {self.city.name}, {self.state.name} {self.zip_code.code}'
