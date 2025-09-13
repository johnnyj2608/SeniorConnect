from rest_framework import serializers
from ..models.enrollment_model import Enrollment

class EnrollmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Enrollment
        exclude = ['created_at']