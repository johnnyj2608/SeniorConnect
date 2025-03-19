from django.urls import path
from .views import member_views, mltc_views

urlpatterns = [
    path('members/', member_views.getMembers, name="members"),
    path('members/<str:pk>/', member_views.getMember, name="member"),
    path('mltc/', mltc_views.getMLTCs, name="mltcs"),
    path('mltc/<str:pk>/', mltc_views.getMLTC, name="mltc"),
]