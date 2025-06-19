from django.contrib import admin

# Register your models here.

from .models import User

class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'name', 'is_org_admin', 'is_active', 'created_at')
    search_fields = ('email', 'name')
    list_filter = ('is_org_admin', 'is_staff', 'is_active')

admin.site.register(User, UserAdmin)