from django.contrib import admin

# Register your models here.

from .models.sadc_model import Sadc
from .models.mltc_model import Mltc
from .models.gift_model import Gift
from .models.snapshot_model import Snapshot

admin.site.register(Sadc)
admin.site.register(Mltc)
admin.site.register(Gift)
admin.site.register(Snapshot)