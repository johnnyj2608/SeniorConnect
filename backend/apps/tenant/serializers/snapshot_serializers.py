from rest_framework import serializers
from ..models.snapshot_model import Snapshot

class SnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Snapshot
        exclude = ['created_at']