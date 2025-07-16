from django.urls import path
from .views import (
    sadc_views,
    mltc_views,
    gift_views,
    snapshot_views,
)
from ...utils.pdf_utils import generateSnapshotPdf

urlpatterns = [
    # Sadc related paths
    path('sadcs/', sadc_views.getSadc, name="sadc"),

    # Mltc related paths
    path('mltcs/<str:pk>/', mltc_views.getMltc, name="mltc"),
    path('mltcs/', mltc_views.getMltcs, name="mltcs"),

    # Mltc related paths
    path('gifts/active/', gift_views.getActiveGifts, name="active_gifts"),
    path('gifts/<str:pk>/', gift_views.getGift, name="gift"),
    path('gifts/', gift_views.getGifts, name="gifts"),

    # Snapshot related paths
    path('snapshots/recent/', snapshot_views.getRecentSnapshotLogs, name='snapshots_recent'),
    path('snapshots/<str:pk>/', snapshot_views.getSnapshot, name='snapshot'),
    path('snapshots/', snapshot_views.getSnapshots, name='snapshots'),
    # path('snapshots/preview/<int:sadc_id>/', generateSnapshotPdf, name='snapshot_preview'),
]
