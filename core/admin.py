from django.contrib import admin

# Register your models here.

from .models.member_model import Member, Language
from .models.address_model import Address, City, State, ZipCode
from .models.mltc_model import MLTC
from .models.contact_model import CareManager, MemberEmergencyContact, RelationshipType, PrimaryCareProvider, Pharmacy
from .models.authorization_model import Authorization, Diagnosis
from .models.sadc_model import SADC

admin.site.register(Member)
admin.site.register(Language)
admin.site.register(Address)
admin.site.register(City)
admin.site.register(State)
admin.site.register(ZipCode)
admin.site.register(MLTC)
admin.site.register(CareManager)
admin.site.register(MemberEmergencyContact)
admin.site.register(RelationshipType)
admin.site.register(PrimaryCareProvider)
admin.site.register(Pharmacy)
admin.site.register(Authorization)
admin.site.register(Diagnosis)
admin.site.register(SADC)