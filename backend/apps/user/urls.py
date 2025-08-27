from django.urls import path
from . import views

urlpatterns = [
    path('users/<str:pk>/', views.getUser, name='user'),
    path('users/', views.getUsers, name='users'),

    path('auth/reset-password/', views.passwordReset, name='password_reset'),
    path('auth/set-password/<str:uidb64>/<str:token>/', views.passwordSet, name='password_set'),
    path('auth/login/verify/', views.loginVerify, name='verify_login'),
    path('auth/login/', views.login, name='login'),
    path('auth/logout/', views.logout, name='logout'),
    path('auth/refresh/', views.refreshToken, name='refresh_token'),
    path('auth/me/', views.getAuthenticatedUser, name='user_me'),
]