from django.urls import path
from .views import (
    mltc_views,
    language_views,
    sadc_views,
)

urlpatterns = [
    # SADC related paths
    path('sadc/', sadc_views.getSadc, name="sadc"),

    # MLTC related paths
    path('mltcs/<str:pk>/', mltc_views.getMLTC, name="mltc"),
    path('mltcs/', mltc_views.getMLTCs, name="mltcs"),
    
    # Language related paths
    path('languages/<str:pk>/', language_views.getLanguage, name="language"),
    path('languages/', language_views.getLanguages, name="languages"),
]
