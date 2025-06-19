import threading
from rest_framework_simplejwt.authentication import JWTAuthentication

_thread_locals = threading.local()

def get_current_user():
    return getattr(_thread_locals, 'user', None)

class JWTAuthenticationFromCookie(JWTAuthentication):
    def authenticate(self, request):
        raw_token = request.COOKIES.get('access')
        if not raw_token:
            return None
        validated_token = self.get_validated_token(raw_token)
        user = self.get_user(validated_token)

        _thread_locals.user = user

        return user, validated_token