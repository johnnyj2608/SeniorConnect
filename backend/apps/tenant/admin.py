from django.contrib import admin

# Register your models here.

from .models.language_model import Language
from .models.mltc_model import MLTC
from .models.sadc_model import Sadc

admin.site.register(Language)
admin.site.register(MLTC)
admin.site.register(Sadc)