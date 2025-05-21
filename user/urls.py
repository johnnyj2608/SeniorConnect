from django.urls import path
from .views import getStaffUsers, getStaffUser

urlpatterns = [
    path('users/<int:pk>/', getStaffUser, name='staff-user'),
    path('users/', getStaffUsers, name='staff-users'),
]
