from django.urls import path
from .views import member_views, mltc_views, authorization_views

urlpatterns = [
    path('members/', member_views.getMembers, name="members"),
    path('members/<str:pk>/', member_views.getMember, name="member"),
    path('mltc/', mltc_views.getMLTCs, name="mltcs"),
    path('auths/member/<str:pk>/', authorization_views.getAuthorizationsByMember, name="auth_by_member"),
]