from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import getUsers, getUser

urlpatterns = [
    path('users/<int:pk>/', getUser, name='staff-user'),
    path('users/', getUsers, name='staff-users'),

    # JWT auth endpoints
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
