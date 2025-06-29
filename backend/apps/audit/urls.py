from django.urls import path
from .views import (
    audit_views, 
    enrollment_views
)

urlpatterns = [
    # Audit related paths
    path('audits/recent/', audit_views.getRecentAuditLogs, name='audits_recent'),
    path('audits/<str:pk>/', audit_views.getAudit, name='audits'),
    path('audits/', audit_views.getAudits, name='audts'),

    # Enrollment related paths
    path('enrollments/recent/', enrollment_views.getEnrollmentRecent, name="enrollments_recent"),
    path('enrollments/stats/', enrollment_views.getEnrollmentStats, name="enrollments_stats"),
    path('enrollments/', enrollment_views.getEnrollments, name="enrollments"),
]