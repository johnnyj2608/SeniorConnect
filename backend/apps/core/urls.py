from django.urls import path
from .views import (
    member_views,
    authorization_views,
    contact_views,
    absence_views,
    file_views,
)

urlpatterns = [
    # Member related paths
    path('members/csv/', member_views.getMembersCsv, name="members_csv"),
    path('members/stats/', member_views.getMembersStats, name="members_stats"),
    path('members/birthdays/', member_views.getMembersBirthdays, name="members_birthdays"),
    path('members/deleted/', member_views.getMembersDeleted, name="members_deleted"),
    path('members/<str:pk>/auth/', member_views.getMemberAuth, name="member_auth"),
    path('members/<str:pk>/profile/', member_views.getMemberDetailFull, name="member_profile"),
    path('members/<str:pk>/status/', member_views.toggleStatus, name="member_status"),
    path('members/<str:pk>/', member_views.getMember, name="member"),
    path('members/', member_views.getMembers, name="members"),

    # Authorization related paths
    path('auths/member/<str:pk>/', authorization_views.getAuthorizationsByMember, name="auth_by_member"),
    path('auths/<str:pk>/<str:member_pk>/', authorization_views.authorizationDelete, name="auth_delete"),
    path('auths/<str:pk>/', authorization_views.getAuthorization, name="auth"),
    path('auths/', authorization_views.getAuthorizations, name="auths"),

    # Contact related paths
    path('contacts/search/', contact_views.searchContacts, name="contact_search"),
    path('contacts/member/<str:pk>/', contact_views.getContactsByMember, name="contact_by_member"),
    path('contacts/<str:pk>/<str:member_pk>/', contact_views.getContactWithMember, name="contact_with_member"),
    path('contacts/<str:pk>/', contact_views.getContact, name="contact"),
    path('contacts/', contact_views.getContacts, name="contacts"),

    # Absence related paths
    path('assessments/upcoming/', absence_views.getAssessmentUpcoming, name="assessments_upcoming"),
    path('absences/upcoming/', absence_views.getAbsencesUpcoming, name="absences_upcoming"),
    path('absences/member/<str:pk>/', absence_views.getAbsencesByMember, name="absence_by_member"),
    path('absences/<str:pk>/<str:member_pk>/', absence_views.absenceDelete, name="absence_delete"),
    path('absences/<str:pk>/', absence_views.getAbsence, name="absence"),
    path('assessments/', absence_views.getAssessments, name="assessments"),
    path('absences/', absence_views.getAbsences, name="absences"),

    # File related paths
    path('files/member/<str:pk>/', file_views.getFilesByMember, name="file_by_member"),
    path('files/<str:pk>/<str:member_pk>/', file_views.fileDelete, name="file_delete"),
    path('files/<str:pk>/', file_views.getFile, name="file"),
    path('files/', file_views.getFiles, name="files"),
]
