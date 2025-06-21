from django.urls import path
from .views import (
    mltc_views,
    sadc_views,
)

urlpatterns = [
    # Sadc related paths
    path('sadcs/', sadc_views.getSadc, name="sadc"),

    # Mltc related paths
    path('mltcs/<str:pk>/', mltc_views.getMltc, name="mltc"),
    path('mltcs/', mltc_views.getMltcs, name="mltcs"),
]
