from rest_framework import serializers
from ..models.absence_model import Absence
from datetime import timedelta
from django.utils import timezone

class AbsenceSerializer(serializers.ModelSerializer):
    member_name = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = Absence
        exclude = ['created_at', 'updated_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['absence_type'] = instance.get_absence_type_display()
        return data

    def get_member_name(self, obj):
        return f"{obj.member.sadc_member_id}. {obj.member.last_name}, {obj.member.first_name}"
    
    def get_status(self, obj):
        today = timezone.now().date()
        start = obj.start_date
        end = obj.end_date

        if not start:
            return ''
        elif start > today:
            return 'Upcoming'
        elif end and end < today:
            return 'Completed'
        elif start <= today and (end is None or end >= today):
            return 'Ongoing'
        return ''

    def validate(self, data):
        start = data.get('start_date')
        end = data.get('end_date')

        if start and end and end < start:
            raise serializers.ValidationError("End date cannot be before start date.")
        
        return data
    
class AbsenceUpcomingSerializer(serializers.ModelSerializer):
    absence_type = serializers.SerializerMethodField()
    member_name = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    days_until = serializers.SerializerMethodField()
    
    class Meta:
        model = Absence
        fields = [
            'id',
            'member_name',
            'absence_type',
            'status',
            'days_until',
        ]

    def get_absence_type(self, obj):
        return obj.get_absence_type_display()

    def get_member_name(self, obj):
        return f"{obj.member.last_name}, {obj.member.first_name}"

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