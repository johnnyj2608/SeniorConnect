from django.contrib import admin

# Register your models here.

from .models.sadc_model import Sadc
from .models.mltc_model import Mltc
from .models.snapshot_model import Snapshot

admin.site.register(Sadc)
admin.site.register(Mltc)
admin.site.register(Snapshot)