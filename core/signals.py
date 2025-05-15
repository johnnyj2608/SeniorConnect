from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from .models.member_model import Member
from .models.authorization_model import Authorization, Enrollment
from django.db import transaction

@receiver(post_save, sender=Member)
def handle_member_change(sender, instance, created, **kwargs):
    active_auth = instance.active_auth

    if not active_auth:
        return
    
    with transaction.atomic():
        if instance.active == False:
            Enrollment.objects.create(
                member=instance,
                enrollment=False,
                mltc=active_auth.mltc,
            )
        active_auth.active = False

@receiver(post_save, sender=Authorization)
def handle_authorization_change(sender, instance, created, **kwargs):
    member = instance.member

    if not member:
        return
    
    with transaction.atomic():

        if instance.active:
            if member.active_auth == None or member.active_auth.mltc != instance.mltc:
                Enrollment.objects.create(
                    member=member,
                    enrollment=True,
                    mltc=instance.mltc
                )
                if member.enrollment_date is None:
                    member.enrollment_date = instance.start_date
        else:
            if not created and member.active_auth.mltc == instance.mltc:
                Enrollment.objects.create(
                    member=member,
                    enrollment=False,
                    mltc=instance.mltc,
                )

        member.save()