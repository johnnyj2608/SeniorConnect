from django.db import models
from django.utils import timezone
from datetime import timedelta
from django.db.models import Q
from backend.apps.tenant.models.sadc_model import Sadc

class MemberQuerySet(models.QuerySet):
    def accessible_by(self, user):
        qs = self
        user_sadc = getattr(user, 'sadc', None)
        allowed_mltcs = user.allowed_mltcs.all()

        if user.is_superuser:
            return qs
        elif getattr(user, 'is_org_admin', False):
            return qs.filter(sadc=user_sadc)
        else:
            return qs.filter(
                sadc=user_sadc,
            ).filter(
                Q(active_auth__mltc__in=allowed_mltcs) | Q(active_auth__isnull=True)
            )

class MemberManager(models.Manager):
    def get_queryset(self):
        return MemberQuerySet(self.model, using=self._db)

    def accessible_by(self, user):
        return self.get_queryset().accessible_by(user)

class Member(models.Model):
    sadc = models.ForeignKey(Sadc, on_delete=models.CASCADE, related_name='members')
    sadc_member_id = models.IntegerField(null=False, blank=False)
    photo = models.URLField(null=True, blank=True)
    first_name = models.CharField(max_length=50, null=False, blank=False)
    last_name = models.CharField(max_length=50, null=False, blank=False)
    alt_name = models.CharField(max_length=50, null=True, blank=True)
    birth_date = models.DateField(null=False, blank=False)
    gender = models.CharField(max_length=1, choices=[('M', 'Male'), ('F', 'Female')], null=False, blank=False)
    address = models.CharField(max_length=220, null=True, blank=True)
    phone = models.CharField(max_length=10, null=True, blank=True)
    email = models.EmailField(max_length=220, null=True, blank=True)
    medicaid = models.CharField(max_length=8, null=True, blank=True)
    ssn = models.CharField(max_length=9, null=True, blank=True)
    language = models.CharField(max_length=50, blank=True, null=True)
    enrollment_date = models.DateField(null=True, blank=True) 
    note = models.CharField(max_length=220, blank=True, null=True)
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
        verbose_name = "Member"
        verbose_name_plural = "Members"

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
    def sadc_name(self):
        return self.sadc.name if self.sadc else None
    
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