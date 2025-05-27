from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import AnonymousUser
from user.authentication import get_current_user
from audit.models import AuditLog
from core.models.member_model import Member
from core.models.contact_model import Contact
from core.models.authorization_model import Authorization
from core.models.absence_model import Absence
from core.models.file_model import File

WHITELISTED_MODELS = (Member, Contact, Authorization, Absence, File)

def get_related_member(instance):
    if isinstance(instance, Member):
        return instance
    return getattr(instance, 'member', None)

@receiver(post_save)
def log_create_update(sender, instance, created, **kwargs):
    if sender not in WHITELISTED_MODELS or getattr(instance, '_skip_audit', False) or kwargs.get('raw', False):
        return

    user = get_current_user()
    if isinstance(user, AnonymousUser) or not getattr(user, 'is_authenticated', False):
        user = None

    content_type = ContentType.objects.get_for_model(sender)
    member = get_related_member(instance)

    AuditLog.objects.create(
        user=user,
        content_type=content_type,
        object_id=instance.pk,
        action_type=AuditLog.CREATE if created else AuditLog.UPDATE,
        member=member
    )

@receiver(pre_delete)
def log_delete(sender, instance, **kwargs):
    if sender not in WHITELISTED_MODELS or kwargs.get('raw', False):
        return

    user = get_current_user()
    if isinstance(user, AnonymousUser) or not getattr(user, 'is_authenticated', False):
        user = None

    content_type = ContentType.objects.get_for_model(sender)
    member = get_related_member(instance)

    AuditLog.objects.create(
        user=user,
        content_type=content_type,
        object_id=instance.pk,
        action_type=AuditLog.DELETE,
        member=member
    )