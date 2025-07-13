from django.contrib import admin

# Register your models here.

from .models.member_model import Member
from .models.contact_model import Contact
from .models.authorization_model import Authorization, AuthorizationService
from .models.absence_model import Absence
from .models.file_model import File
from .models.gifted_model import Gifted

admin.site.register(Member)
admin.site.register(Contact)
admin.site.register(Authorization)
admin.site.register(AuthorizationService)
admin.site.register(Absence)
admin.site.register(File)
admin.site.register(Gifted)