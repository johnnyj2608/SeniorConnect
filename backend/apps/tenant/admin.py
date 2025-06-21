from django.contrib import admin

# Register your models here.

from .models.mltc_model import Mltc
from .models.sadc_model import Sadc

admin.site.register(Mltc)
admin.site.register(Sadc)