from django.db.models.signals import post_save
from django.dispatch import receiver
from .models.authorization_model import Authorization, Enrollment
from django.db import transaction
from datetime import timedelta

@receiver(post_save, sender=Authorization)
def handle_authorization_change(sender, instance, created, **kwargs):
    member = instance.member

    if not member:
        return
    
    with transaction.atomic():
        if member.active_auth == None or member.active_auth.mltc != instance.mltc:
            if instance.active:
                Enrollment.objects.create(
                    member=member,
                    change_type=Enrollment.ENROLLMENT,
                    mltc=instance.mltc
                )
                if member.enrollment_date is None:
                    member.enrollment_date = instance.start_date

                if member.active_auth != instance:
                    member.active_auth = instance
            else:
                if not created:
                    Enrollment.objects.create(
                        member=member,
                        change_type=Enrollment.DISENROLLMENT,
                        mltc=instance.mltc,
                    )
                    member.active_auth = None

        member.save()