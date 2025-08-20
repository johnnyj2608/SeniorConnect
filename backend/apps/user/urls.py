from django.urls import path
from . import views

urlpatterns = [
    path('users/<str:pk>/', views.getUser, name='user'),
    path('users/', views.getUsers, name='users'),

    path('auth/reset-password/', views.passwordReset, name='password_reset'),
    path('auth/set-password/<str:uidb64>/<str:token>/', views.passwordSet, name='password_set'),
    path('auth/login/', views.cookieLogin, name='cookie_login'),
    path('auth/logout/', views.cookieLogout, name='cookie_logout'),
    path('auth/refresh/', views.cookieRefresh, name='cookie_refresh'),
    path('auth/me/', views.getAuthenticatedUser, name='user_me'),
]