from django.urls import path
from . import views

urlpatterns = [
    path('audits/<str:pk>/', views.getAudit, name='audits'),
    path('audits/', views.getAudits, name='audts'),
]