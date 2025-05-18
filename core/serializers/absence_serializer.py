from rest_framework import serializers
from ..models.absence_model import Absence

class AbsenceSerializer(serializers.ModelSerializer):
    member_name = serializers.SerializerMethodField()
    sadc_member_id = serializers.SerializerMethodField()

    class Meta:
        model = Absence
        exclude = ['created_at', 'updated_at']

    def get_member_name(self, obj):
        return f"{obj.member.last_name}, {obj.member.first_name} "

    def get_sadc_member_id(self, obj):
        return obj.member.sadc_member_id

    def validate(self, data):
        start = data.get('start_date')
        end = data.get('end_date')

        if start and end and end < start:
            raise serializers.ValidationError("End date cannot be before start date.")
        
        return data