from django.urls import path
from .views import (
    member_views,
    mltc_views,
    authorization_views,
    language_views,
    contact_views,
    absence_views,
    file_views,
)

urlpatterns = [
    # Member related paths
    path('members/', member_views.getMembers, name="members"),
    path('members/<str:pk>/', member_views.getMember, name="member"),
    
    # MLTC related paths
    path('mltcs/', mltc_views.getMLTCs, name="mltcs"),
    
    # Language related paths
    path('languages/', language_views.getLanguages, name="languages"),

    # Authorization related paths
    path('auths/active/<str:pk>/', authorization_views.getActiveAuthorizationsByMember, name="active_auth_by_member"),
    path('auths/member/<str:pk>/', authorization_views.getAuthorizationsByMember, name="auth_by_member"),
    path('auths/<str:pk>/', authorization_views.getAuthorization, name="auth"),
    path('auths/', authorization_views.getAuthorizations, name="auths"),

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

    # FileTab related paths
    path('file-tabs/latest/<str:pk>/', file_views.getFileTabsLatestVersion, name="latest_versions_by_tab"),
    path('file-tabs/member/<str:pk>/', file_views.getFileTabsByMember, name="file_tabs_by_member"),
    path('file-tabs/<str:pk>/', file_views.getFileTab, name="file_tab"),
    path('file-tabs/', file_views.getFileTabs, name="file_tabs"),
    
    # FileVersion related paths
    path('file-versions/tab/<str:pk>/', file_views.getFileVersionsByTab, name="file_versions_by_tab"),
    path('file-versions/<str:pk>/', file_views.getFileVersion, name="file_version"),
    path('file-versions/', file_views.getFileVersions, name="file_versions"),
]
