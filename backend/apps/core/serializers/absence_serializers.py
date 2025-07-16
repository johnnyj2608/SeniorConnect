from rest_framework import serializers
from ..models.absence_model import Absence, Assessment
from django.utils import timezone
from backend.apps.user.models import User
from .member_serializers import MemberNameSerializer
from .mixins import DateRangeValidationMixin, DaysUntilMixin

class AbsenceSerializer(MemberNameSerializer, DateRangeValidationMixin):        
    class Meta:
        model = Absence
        exclude = ['created_at', 'updated_at']

class AbsenceUpcomingSerializer(DaysUntilMixin, MemberNameSerializer):
    days_until = serializers.SerializerMethodField()
    
    class Meta:
        model = Absence
        fields = [
            'id',
            'member',
            'sadc_member_id',
            'member_name',
            'alt_name',
            'absence_type',
            'days_until',
        ]

    def get_target_date(self, obj):
        today = timezone.now().date()
        if obj.start_date >= today:
            return obj.start_date
        if obj.end_date and obj.end_date >= today:
            return obj.end_date
        return None

class AssessmentSerializer(MemberNameSerializer, DateRangeValidationMixin):
    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=False,
        allow_null=True
    )
    user_name = serializers.ReadOnlyField(source='user.name')
    
    class Meta:
        model = Assessment
        exclude = ['created_at', 'updated_at', 'end_date', 'called']

    def validate(self, data):
        if data.get('absence_type') == 'assessment':
            data['end_date'] = None

        return self.validate_date_range(data)