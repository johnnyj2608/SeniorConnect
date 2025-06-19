from rest_framework import serializers
from ..models.file_model import File

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        exclude = ['created_at', 'updated_at']