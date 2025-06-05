from django.db.models import DateTimeField
from django.db.models.signals import post_save, pre_save, pre_delete, m2m_changed
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import AnonymousUser
from user.authentication import get_current_user
from audit.models import AuditLog
from core.models.member_model import Member
from core.models.contact_model import Contact
from core.models.authorization_model import Authorization, MLTC
from core.models.absence_model import Absence
from core.models.file_model import File

WHITELISTED_MODELS = (Member, Contact, Authorization, MLTC, Absence, File)

def get_related_member(instance):
    if hasattr(instance, '_acting_member'):
        return instance._acting_member
    if isinstance(instance, Member):
        return instance
    return getattr(instance, 'member', None)

@receiver(pre_save)
def store_original_values(sender, instance, **kwargs):
    if sender in WHITELISTED_MODELS and instance.pk:
        try:
            instance._original_values = {
                field.name: getattr(sender.objects.get(pk=instance.pk), field.name)
                for field in sender._meta.fields
            }
        except sender.DoesNotExist:
            instance._original_values = {}

@receiver(post_save)
def log_create_update(sender, instance, created, **kwargs):
    if sender not in WHITELISTED_MODELS or getattr(instance, '_skip_audit', False) or kwargs.get('raw', False):
        return

    user = get_current_user()
    if isinstance(user, AnonymousUser) or not getattr(user, 'is_authenticated', False):
        user = None

    content_type = ContentType.objects.get_for_model(sender)
    member = get_related_member(instance)

    if sender == Contact and created:
        return  # Handled by m2m signal

    changes = {}
    if not created:
        original = getattr(instance, '_original_values', {})
        for field in instance._meta.fields:
            field_name = field.name
            if isinstance(field, DateTimeField) and (field.auto_now or field.auto_now_add):
                continue

            old_value = original.get(field_name)
            new_value = getattr(instance, field_name)

            print(old_value, new_value)

            if old_value in [None, ''] and new_value in [None, '']:
                continue

            if old_value != new_value:
                changes[field_name] = {'old': old_value, 'new': new_value}

        if sender == Authorization and changes.keys() == {'active'}:
            return

    AuditLog.objects.create(
        user=user,
        content_type=content_type,
        object_id=instance.pk,
        action_type=AuditLog.CREATE if created else AuditLog.UPDATE,
        member=member,
        object_display=str(instance),
        changes=changes,
    )

@receiver(pre_delete)
def log_delete(sender, instance, **kwargs):
    if sender not in WHITELISTED_MODELS or kwargs.get('raw', False):
        return
    
    if sender == Contact:
        return  # Handled by m2m signal

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
        member=member,
        object_display=str(instance),
    )

@receiver(m2m_changed, sender=Contact.members.through)
def log_contact_membership_change(sender, instance, action, reverse, model, pk_set, **kwargs):
    if action not in ['post_add', 'post_remove']:
        return

    if not pk_set:
        return

    user = get_current_user()
    if isinstance(user, AnonymousUser) or not getattr(user, 'is_authenticated', False):
        user = None

    content_type = ContentType.objects.get_for_model(Contact)
    action_type = AuditLog.CREATE if action == 'post_add' else AuditLog.DELETE

    for member_id in pk_set:
        AuditLog.objects.create(
            user=user,
            content_type=content_type,
            object_id=instance.pk,
            action_type=action_type,
            member_id=member_id,
            object_display=str(instance),
        )
