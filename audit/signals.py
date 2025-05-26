from django.forms.models import model_to_dict
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType

from user.authentication import get_current_user
from audit.models import AuditLog
from core.models.member_model import Member
from core.models.contact_model import Contact
from core.models.authorization_model import Authorization
from core.models.absence_model import Absence
from core.models.file_model import File

from django.contrib.auth.models import AnonymousUser

WHITELISTED_MODELS = (Member, Contact, Authorization, Absence, File)

@receiver(post_save)
def log_create_update(sender, instance, created, **kwargs):
    if sender not in WHITELISTED_MODELS:
        return

    user = get_current_user()

    if user is None or isinstance(user, AnonymousUser) or not getattr(user, 'is_authenticated', False):
        user = None

    content_type = ContentType.objects.get_for_model(instance.__class__)

    AuditLog.objects.create(
        user=user,
        content_type=content_type,
        object_id=instance.pk,
        action=AuditLog.CREATE if created else AuditLog.UPDATE,
        changes={}
    )

@receiver(pre_delete)
def log_delete(sender, instance, **kwargs):
    if sender not in WHITELISTED_MODELS:
        return

    user = get_current_user()

    if user is None or isinstance(user, AnonymousUser) or not getattr(user, 'is_authenticated', False):
        user = None

    content_type = ContentType.objects.get_for_model(instance.__class__)

    AuditLog.objects.create(
        user=user,
        content_type=content_type,
        object_id=instance.pk,
        action_type=AuditLog.DELETE,
        changes={}
    )
