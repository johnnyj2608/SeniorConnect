from django.contrib import admin

# Register your models here.

from .models.member_model import Member, Language
from .models.contact_model import Contact
from .models.authorization_model import Authorization, MLTC
from .models.absence_model import Absence
from .models.file_model import File

admin.site.register(Member)
admin.site.register(Language)
admin.site.register(MLTC)
admin.site.register(Contact)
admin.site.register(Authorization)
admin.site.register(Absence)
admin.site.register(File)