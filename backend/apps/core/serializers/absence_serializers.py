from rest_framework import serializers
from ..models.absence_model import Absence
from django.utils import timezone
from ...user.models import User
from .member_serializers import MemberNameSerializer
from .mixins import DateRangeValidationMixin, DaysUntilMixin

class AbsenceSerializer(MemberNameSerializer, DateRangeValidationMixin):    
    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=False,
        allow_null=True
    )
    user_name = serializers.ReadOnlyField(source='user.name')
    
    class Meta:
        model = Absence
        exclude = ['created_at', 'updated_at']

    def validate(self, data):
        if data.get('absence_type') == 'assessment':
            data['end_date'] = None

        return self.validate_date_range(data)

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

class AssessmentSerializer(MemberNameSerializer):
    user_name = serializers.ReadOnlyField(source='user.name')
    
    class Meta:
        model = Absence
        fields = [
            'id',
            'member',
            'sadc_member_id',
            'member_name',
            'alt_name',
            'user_name',
            'start_date',
            'time',
        ]