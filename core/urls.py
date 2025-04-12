from django.urls import path
from .views import member_views, mltc_views, authorization_views, language_views, contact_views

urlpatterns = [
    path('members/', member_views.getMembers, name="members"),
    path('members/<str:pk>/', member_views.getMember, name="member"),
    path('mltcs/', mltc_views.getMLTCs, name="mltcs"),
    path('languages/', language_views.getLanguages, name="languages"),
    path('auths/', authorization_views.getAuthorizations, name="auths"),
    path('auths/<str:pk>/', authorization_views.getAuthorization, name="auth"),
    path('auths/member/<str:pk>/', authorization_views.getAuthorizationsByMember, name="auth_by_member"),
    path('contacts/', contact_views.getContacts, name="contacts"),
    path('contacts/<str:pk>/', contact_views.getContact, name="contact"),
    path('contacts/member/<str:pk>/', contact_views.getContactsByMember, name="contact_by_member"),
]