from django.urls import path
from . import views

urlpatterns = [
    path('audits/<int:pk>/', views.getAudit, name='audit'),
    path('audits/', views.getAudits, name='audts'),
]