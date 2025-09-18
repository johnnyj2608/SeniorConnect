from django.db.models import DateTimeField
from django.db.models.signals import post_save, pre_save, pre_delete, m2m_changed
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import AnonymousUser
from .models.audit_model import AuditLog
from ..user.authentication import get_current_user
from ..core.models.member_model import Member
from ..core.models.contact_model import Contact
from ..core.models.authorization_model import Authorization
from ..core.models.absence_model import Absence
from ..core.models.file_model import File
from ..core.models.gifted_model import Gifted

WHITELISTED_MODELS = (Member, Contact, Authorization, Absence, File, Gifted)

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
    user_id, user_name = None, None
    if user and getattr(user, 'is_authenticated', False) and not isinstance(user, AnonymousUser):
        user_id = user.id
        user_name = user.name

    member = get_related_member(instance)
    member_id = member.id if member else None
    member_name = f"{member.last_name}, {member.first_name}" if member else None
    member_alt_name = member.alt_name if member and member.alt_name else None

    action_type = AuditLog.CREATE if created else AuditLog.UPDATE
    changes = {}

    if not created:
        original = getattr(instance, '_original_values', {})

        deleted_at_old = original.get('deleted_at')
        deleted_at_new = getattr(instance, 'deleted_at', None)
        if deleted_at_old in [None, ''] and deleted_at_new not in [None, '']:
            action_type = AuditLog.DELETE
        else:
            for field in instance._meta.fields:
                field_name = field.name
                if isinstance(field, DateTimeField) and (field.auto_now or field.auto_now_add):
                    continue

                old_value = original.get(field_name)
                new_value = getattr(instance, field_name)

                if field.is_relation and hasattr(field, 'related_model'):
                    old_value = getattr(old_value, 'name', str(old_value)) if old_value else old_value
                    new_value = getattr(new_value, 'name', str(new_value)) if new_value else new_value

                if old_value in [None, ''] and new_value in [None, '']:
                    continue

                if old_value != new_value:
                    changes[field_name] = {'old': old_value, 'new': new_value}

            if sender == Authorization and changes.keys() == {'active'}:
                return
            if not changes:
                return

    AuditLog.objects.create(
        user_id=user_id,
        user_name=user_name,
        member_id=member_id,
        member_name=member_name,
        member_alt_name=member_alt_name,
        content_type=ContentType.objects.get_for_model(sender),
        object_id=instance.pk,
        object_name=str(instance),
        action_type=action_type,
        changes=None if action_type == AuditLog.DELETE else changes,
    )

@receiver(pre_delete)
def log_delete(sender, instance, **kwargs):
    if sender not in WHITELISTED_MODELS or kwargs.get('raw', False):
        return
    
    if sender == Contact:
        return  # Handled by m2m signal

    user = get_current_user()
    user_id, user_name = None, None
    if user and getattr(user, 'is_authenticated', False) and not isinstance(user, AnonymousUser):
        user_id = user.id
        user_name = user.name

    member = get_related_member(instance)
    member_id = member.id if member else None
    member_name = f"{member.last_name}, {member.first_name}" if member else None
    member_alt_name = member.alt_name if member and member.alt_name else None

    AuditLog.objects.create(
        user_id=user_id,
        user_name=user_name,
        member_id=member_id,
        member_name=member_name,
        member_alt_name=member_alt_name,
        content_type=ContentType.objects.get_for_model(sender),
        object_id=instance.pk,
        object_name=str(instance),
        action_type=AuditLog.DELETE,
    )

@receiver(m2m_changed, sender=Contact.members.through, dispatch_uid="audit_contact_m2m")
def log_contact_membership_change(sender, instance, action, reverse, model, pk_set, **kwargs):
    if action not in ['post_add', 'post_remove']:
        return

    if not pk_set:
        return

    user = get_current_user()
    user_id, user_name = None, None
    if user and getattr(user, 'is_authenticated', False) and not isinstance(user, AnonymousUser):
        user_id = user.id
        user_name = f"{user.last_name}, {user.first_name}"

    content_type = ContentType.objects.get_for_model(Contact)
    action_type = AuditLog.CREATE if action == 'post_add' else AuditLog.DELETE

    for member_id in pk_set:
        member = Member.objects.filter(id=member_id).first()
        AuditLog.objects.create(
            user_id=user_id,
            user_name=user_name,
            member_id=member_id,
            member_name = f"{member.last_name}, {member.first_name}" if member else None,
            member_alt_name = member.alt_name if member and member.alt_name else None,
            content_type=content_type,
            object_id=instance.pk,
            object_name=str(instance),
            action_type=action_type,
        )