from rest_framework import serializers
from ..models.file_model import FileTab, FileVersion

class FileTabSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileTab
        fields = '__all__'

class FileVersionSerializer(serializers.ModelSerializer):

    class Meta:
        model = FileVersion
        fields = '__all__'