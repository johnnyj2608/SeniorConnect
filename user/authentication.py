from rest_framework_simplejwt.authentication import JWTAuthentication

class JWTAuthenticationFromCookie(JWTAuthentication):
    def get_raw_token(self, request):
        return request.COOKIES.get('access')
