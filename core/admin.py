from django.contrib import admin

# Register your models here.

from .models.member_model import Member, Language
from .models.address_model import Address, City, State, ZipCode
from .models.contact_model import Contact
from .models.authorization_model import Authorization, MLTC
from .models.sadc_model import SADC

admin.site.register(Member)
admin.site.register(Language)
admin.site.register(Address)
admin.site.register(City)
admin.site.register(State)
admin.site.register(ZipCode)
admin.site.register(MLTC)
admin.site.register(Contact)
admin.site.register(Authorization)
admin.site.register(SADC)