from django.urls import path
from .views import member_views

urlpatterns = [
    path('members/', member_views.getMembers, name="members"),
    path('members/<str:pk>/', member_views.getMember, name="member"),
]