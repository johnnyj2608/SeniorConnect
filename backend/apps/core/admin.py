from django.contrib import admin

# Register your models here.

from .models.member_model import Member
from .models.contact_model import Contact
from .models.authorization_model import Authorization
from .models.enrollment_model import Enrollment
from .models.absence_model import Absence
from .models.file_model import File

admin.site.register(Member)
admin.site.register(Contact)
admin.site.register(Authorization)
admin.site.register(Enrollment)
admin.site.register(Absence)
admin.site.register(File)