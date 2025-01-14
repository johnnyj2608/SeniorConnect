from django.urls import path
from . import views

urlpatterns = [
    path('', views.getRoutes, name="routes"),
    path('members/', views.getMembers, name="members"),
    path('members/<str:pk>/', views.getMember, name="member"),
]