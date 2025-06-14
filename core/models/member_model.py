from django.db import models
import os
from django.utils.text import slugify
from django.utils import timezone
from datetime import timedelta
from django.db.models import Q

def member_photo_path(instance, filename):
    """Generate file path for new member photo, overwriting existing one."""
    ext = filename.split('.')[-1]
    filename = f"{instance.first_name}_{instance.last_name}_profile.{ext}"
    name = f"{slugify(instance.first_name)}_{slugify(instance.last_name)}_profile.{ext}"
    return os.path.join(str(instance.id), name)

class Language(models.Model):
    name = models.CharField(max_length=255, null=False, blank=False)

    def __str__(self):
        return self.name

class MemberQuerySet(models.QuerySet):
    def accessible_by(self, user):
        qs = self
        if user.is_superuser or getattr(user, 'is_org_admin', False):
            return qs
        allowed_mltcs = user.allowed_mltcs.all()
        return qs.filter(
            Q(active_auth__mltc__in=allowed_mltcs) | Q(active_auth__isnull=True)
        )

class MemberManager(models.Manager):
    def get_queryset(self):
        return MemberQuerySet(self.model, using=self._db)

    def accessible_by(self, user):
        return self.get_queryset().accessible_by(user)

class Member(models.Model):
    sadc_member_id = models.IntegerField(null=False, blank=False)
    photo = models.URLField(null=True, blank=True)
    first_name = models.CharField(max_length=255, null=False, blank=False)
    last_name = models.CharField(max_length=255, null=False, blank=False)
    alt_name = models.CharField(max_length=255, null=True, blank=True)
    birth_date = models.DateField(null=False, blank=False)
    gender = models.CharField(max_length=1, choices=[('M', 'Male'), ('F', 'Female')], null=False, blank=False)
    address = models.CharField(max_length=255, null=True, blank=True)
    phone = models.CharField(max_length=10, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    medicaid = models.CharField(max_length=8, null=True, blank=True)
    ssn = models.CharField(max_length=9, null=True, blank=True)
    language = models.ForeignKey('Language', null=True, blank=True, on_delete=models.SET_NULL, related_name='members')
    enrollment_date = models.DateField(null=True, blank=True) 
    note = models.TextField(null=True, blank=True)
    active_auth = models.OneToOneField(
        'Authorization',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='active_for_member'
    )
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=False)
    updated_at = models.DateTimeField(auto_now=True, null=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    objects = MemberManager()

    class Meta:
        ordering = ['sadc_member_id']

    def __str__(self):
        return f"{self.sadc_member_id}. {self.first_name} {self.last_name}"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def formal_name(self):
        return f"{self.last_name}, {self.first_name}"
    
    @property
    def is_new(self):
        today = timezone.now().date()
        created_date = self.created_at.date() if self.created_at else None
        enrollment_date = self.enrollment_date
        return (
            (created_date and (today - created_date).days <= 30) or
            (enrollment_date and (today - enrollment_date).days <= 30)
        )
    
    @property
    def mltc_name(self):
        return self.active_auth.mltc.name if self.active_auth and self.active_auth.mltc else None
    
    @property
    def schedule(self):
        return self.active_auth.schedule if self.active_auth else None
    
    @property
    def is_deleted(self):
        return self.deleted_at is not None
    
    @property
    def days_until_30(self):
        if self.deleted_at:
            elapsed = timezone.now() - self.deleted_at
            remaining = timedelta(days=30) - elapsed
            return max(remaining.days, 0)
        return None

    def soft_delete(self):
        self.deleted_at = timezone.now()
        self.save()

    def restore(self):
        self.deleted_at = None
        self.save()

    def toggle_active(self):
        self.active = not self.active
        self.save()