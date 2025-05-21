from django.contrib import admin

# Register your models here.

from .models import StaffUser

class StaffUserAdmin(admin.ModelAdmin):
    list_display = ('email', 'name', 'role', 'is_staff', 'is_active', 'created_at')
    search_fields = ('email', 'name')
    list_filter = ('role', 'is_staff', 'is_active')

admin.site.register(StaffUser, StaffUserAdmin)