from django.db.models.signals import post_save
from django.dispatch import receiver
from .models.member_model import Member
from .models.authorization_model import Enrollment

@receiver(post_save, sender=Member)
def handle_member_change(sender, instance, created, **kwargs):
    if created:
        return
    
    active_auth = instance.active_auth
    if not active_auth:
        return
    
    if instance.active == False:
        Enrollment.objects.create(
            member=instance,
            change_type=Enrollment.DISENROLLMENT,
            new_mltc=None,
            old_mltc=active_auth.mltc,
        )
        instance.active_auth = None
        instance.save(update_fields=['active_auth'])
        
        active_auth.active = False
        active_auth.save()