from django.core.mail import send_mail
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.conf import settings

def generateInviteLink(user, request):
    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    return f"{settings.FRONTEND_URL}/#/login/set-password/{uid}/{token}/"

def sendEmailInvitation(user, request):
    link = generateInviteLink(user, request)
    subject = "You're invited to join Senior Connect"
    
    message = (
        f"Hello {user.name},\n\n"
        f"You have been invited to join Senior Connect. "
        f"Please set your password using the link below:\n\n"
        f"{link}\n\n"
        f"If you did not expect this invitation, please contact your organization administrator."
    )
    
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
    )