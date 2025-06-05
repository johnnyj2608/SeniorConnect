from rest_framework import serializers
from ..models.absence_model import Absence
from datetime import timedelta
from django.utils import timezone
from user.models import User

class AbsenceSerializer(serializers.ModelSerializer):
    member_name = serializers.SerializerMethodField()
    
    user = serializers.SlugRelatedField(
        queryset=User.objects.all(),
        slug_field='name',
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = Absence
        exclude = ['created_at', 'updated_at']

    def get_member_name(self, obj):
        member = obj.member
        if member:
            return f"{member.sadc_member_id}. {member.last_name}, {member.first_name}"
        return None

    def validate(self, data):
        start = data.get('start_date')
        end = data.get('end_date')
        absence_type = data.get('absence_type')

        if absence_type == 'assessment':
            data['end_date'] = None
        elif start and end and end < start:
            raise serializers.ValidationError("End date cannot be before start date.")

        return data
    
class AbsenceUpcomingSerializer(serializers.ModelSerializer):
    member_name = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    days_until = serializers.SerializerMethodField()
    
    class Meta:
        model = Absence
        fields = [
            'id',
            'member',
            'member_name',
            'absence_type',
            'status',
            'days_until',
        ]

    def get_member_name(self, obj):
        member = obj.member
        if member:
            return f"{member.sadc_member_id}. {member.last_name}, {member.first_name}"
        return None

    def get_status(self, obj):
        today = timezone.now().date()
        in_7_days = today + timedelta(days=7)

        if today <= obj.start_date <= in_7_days:
            return "Leaving"
        if obj.end_date and today <= obj.end_date <= in_7_days:
            return "Returning"
        return "N/A"

    def get_days_until(self, obj):
        today = timezone.now().date()
        in_7_days = today + timedelta(days=7)
        if today <= obj.start_date <= in_7_days:
            return (obj.start_date - today).days
        if obj.end_date and today <= obj.end_date <= in_7_days:
            return (obj.end_date - today).days
        return None

class AssessmentSerializer(serializers.ModelSerializer):
    member_name = serializers.SerializerMethodField()
    user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Absence
        fields = [
            'id',
            'member',
            'member_name',
            'user_name',
            'start_date',
            'time',
        ]

    def get_member_name(self, obj):
        member = obj.member
        if member:
            return f"{member.sadc_member_id}. {member.last_name}, {member.first_name}"
        return None
    
    def get_user_name(self, obj):
        user = obj.user

        if user:
            return user.name
        return None