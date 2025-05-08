from rest_framework import serializers
from ..models.absence_model import Absence

class AbsenceSerializer(serializers.ModelSerializer):
    member_name = serializers.SerializerMethodField()
    sadc_member_id = serializers.SerializerMethodField()

    class Meta:
        model = Absence
        fields = [
            'id',
            'start_date',
            'end_date',
            'absence_type',
            'note',
            'member_name',
            'sadc_member_id',
        ]

    def get_member_name(self, obj):
        return f"{obj.member.first_name} {obj.member.last_name}"

    def get_sadc_member_id(self, obj):
        return obj.member.sadc_member_id

    def get_member_name(self, obj):
        return f"{obj.member.first_name} {obj.member.last_name}"

    def validate(self, data):
        start = data.get('start_date')
        end = data.get('end_date')

        if start and end and end < start:
            raise serializers.ValidationError("End date cannot be before start date.")
        
        return data