from django.db.models.signals import post_save
from django.dispatch import receiver
from .models.member_model import Member
from .models.authorization_model import Enrollment

@receiver(post_save, sender=Member)
def handle_member_change(sender, instance, created, **kwargs):
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