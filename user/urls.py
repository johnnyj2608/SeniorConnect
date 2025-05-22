from django.urls import path
from .views import getUsers, getUser, cookieLogin, cookieLogout

urlpatterns = [
    path('users/<int:pk>/', getUser, name='staff-user'),
    path('users/', getUsers, name='staff-users'),

    path('auth/login/', cookieLogin, name='cookie_login'),
    path('auth/logout/', cookieLogout, name='cookie_logout'),
]
