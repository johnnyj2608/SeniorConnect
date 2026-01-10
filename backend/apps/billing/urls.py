from django.urls import path
from . import views

urlpatterns = [
    path("submit-claims/", views.submit_claims, name="submit_claims"),
]