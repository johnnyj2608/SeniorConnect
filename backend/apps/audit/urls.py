from django.urls import path
from . import views

urlpatterns = [
    path('audits/recent/', views.getRecentAuditLogs, name='audits_recent'),
    path('audits/<str:pk>/', views.getAudit, name='audits'),
    path('audits/', views.getAudits, name='audts'),
]