from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models.member_model import Member
from .models.authorization_model import MLTC, Authorization, Enrollment
from .models.authorization_model import Authorization

@receiver(post_save, sender=Member)
def handle_member_change(sender, instance, created, **kwargs):
    # If member set to inactive, consider it disenrollment
    if created:
        return
    
    if instance.active == False and instance.active_auth:
        active_auth = instance.active_auth
        active_auth.active = False
        active_auth.save(update_fields=['active'])

        Enrollment.objects.create(
            member=instance,
            change_type=Enrollment.DISENROLLMENT,
            new_mltc=None,
            old_mltc=active_auth.mltc,
        )

        Member.objects.filter(pk=instance.pk).update(active_auth=None)

@receiver(post_delete, sender=MLTC)
def clear_active_auth_on_mltc_delete(sender, instance, **kwargs):
    # If mltc is deleted, set all members with active auth of that mltc to null
    affected_auths = Authorization.objects.filter(mltc=None)

    for auth in affected_auths:
        try:
            member = auth.active_for_member
            if member and member.active_auth_id == auth.id:
                member.active_auth = None
                member.save(update_fields=['active_auth'])

            auth.active = False
            auth.save(update_fields=['active'])
        except Member.DoesNotExist:
            continue