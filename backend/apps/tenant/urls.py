from django.urls import path
from .views import (
    mltc_views,
    sadc_views,
    snapshot_views,
)
from .utils.pdf_utils import previewSnapshotPdf

urlpatterns = [
    # Sadc related paths
    path('sadcs/', sadc_views.getSadc, name="sadc"),

    # Mltc related paths
    path('mltcs/<str:pk>/', mltc_views.getMltc, name="mltc"),
    path('mltcs/', mltc_views.getMltcs, name="mltcs"),

    # Snapshot related paths
    path('snapshots/recent/', snapshot_views.getRecentSnapshotLogs, name='snapshots_recent'),
    path('snapshots/<str:pk>/', snapshot_views.getSnapshot, name='snapshot'),
    path('snapshots/', snapshot_views.getSnapshots, name='snapshots'),
    path('snapshots/preview/<int:sadc_id>/', previewSnapshotPdf, name='snapshot_preview'),
]
