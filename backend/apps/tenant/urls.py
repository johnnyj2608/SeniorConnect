from django.urls import path
from .views import (
    mltc_views,
    sadc_views,
)

urlpatterns = [
    # SADC related paths
    path('sadc/', sadc_views.getSadc, name="sadc"),

    # MLTC related paths
    path('mltcs/<str:pk>/', mltc_views.getMLTC, name="mltc"),
    path('mltcs/', mltc_views.getMLTCs, name="mltcs"),
]
