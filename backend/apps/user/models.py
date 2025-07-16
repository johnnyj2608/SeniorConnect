from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from ..tenant.models.mltc_model import Mltc
from ..tenant.models.sadc_model import Sadc

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    sadc = models.ForeignKey(Sadc, on_delete=models.CASCADE, related_name='users')
    email = models.EmailField(max_length=220, unique=True, null=True, blank=True)
    name = models.CharField(max_length=50)
    preferences = models.JSONField(default=dict, blank=True)
    allowed_mltcs = models.ManyToManyField(Mltc, blank=True, related_name='users')
    view_snapshots = models.BooleanField(default=False)
    is_org_admin = models.BooleanField(default=False)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)   # Access to Django Admin

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    class Meta:
        ordering = ['is_org_admin', 'name']
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return f"{self.email}: {self.name}"

    def get_full_name(self):
        return self.name