from django.urls import path
from .views import (
    member_views,
    mltc_views,
    authorization_views,
    language_views,
    contact_views,
    absence_views,
    file_views,
    enrollment_views,
)

urlpatterns = [
    # Member related paths
    path('members/<str:pk>/auth/', member_views.getMemberAuth, name="member_auth"),
    path('members/<str:pk>/', member_views.getMember, name="member"),
    path('members/', member_views.getMembers, name="members"),
    
    # MLTC related paths
    path('mltcs/', mltc_views.getMLTCs, name="mltcs"),
    
    # Language related paths
    path('languages/', language_views.getLanguages, name="languages"),

    # Authorization related paths
    path('auths/member/<str:pk>/', authorization_views.getAuthorizationsByMember, name="auth_by_member"),
    path('auths/<str:pk>/', authorization_views.getAuthorization, name="auth"),
    path('auths/', authorization_views.getAuthorizations, name="auths"),

    # Absence related paths
    path('enrollments/', enrollment_views.getEnrollments, name="enrollments"),
    path('enrollment/', enrollment_views.getEnrollment, name="enrollment"),

    # Contact related paths
    path('contacts/search/', contact_views.searchContacts, name="contact_search"),
    path('contacts/member/<str:pk>/', contact_views.getContactsByMember, name="contact_by_member"),
    path('contacts/<str:pk>/delete/<str:member_id>/', contact_views.deleteMemberFromContact, name="delete_member_from_contact"),
    path('contacts/<str:pk>/', contact_views.getContact, name="contact"),
    path('contacts/', contact_views.getContacts, name="contacts"),

    # Absence related paths
    path('absences/member/<str:pk>/', absence_views.getAbsencesByMember, name="absence_by_member"),
    path('absences/<str:pk>/', absence_views.getAbsence, name="absence"),
    path('absences/', absence_views.getAbsences, name="absences"),

    # File related paths
    path('files/member/<str:pk>/', file_views.getFilesByMember, name="file_by_member"),
    path('files/<str:pk>/', file_views.getFile, name="file"),
    path('files/', file_views.getFiles, name="files"),
]
