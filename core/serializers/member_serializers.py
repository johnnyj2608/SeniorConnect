from rest_framework import serializers
from ..models.member_model import Member, Language
from ..models.authorization_model import MLTC
from django.utils import timezone

class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = '__all__'

class MemberSerializer(serializers.ModelSerializer):
    active = serializers.BooleanField(required=False, default=True)
    
    language = serializers.SlugRelatedField(
        queryset=Language.objects.all(), 
        slug_field='name', 
        allow_null=True,
        required=False
    )
    mltc = serializers.PrimaryKeyRelatedField(
        queryset=MLTC.objects.all(),
        required=False,
        allow_null=True
    )

    class Meta:
        model = Member
        exclude = ['created_at', 'updated_at']

class MemberListSerializer(serializers.ModelSerializer):
    mltc = serializers.SerializerMethodField()
    schedule = serializers.SerializerMethodField()

    class Meta:
        model = Member
        fields =(
            'id',
            'sadc_member_id', 
            'photo',
            'first_name', 
            'last_name', 
            'birth_date', 
            'phone',
            'active',
            'mltc',
            'schedule',
        )
        
    def get_mltc(self, obj):
        """Fetch the MLTC name from the active authorization."""
        active_auth = obj.active_auth
        if active_auth and active_auth.mltc:
            return active_auth.mltc.name
        return None

    def get_schedule(self, obj):
        """Fetch the schedule from the active authorization."""
        active_auth = obj.active_auth
        if active_auth:
            return active_auth.schedule
        return None

class MemberBirthdaySerializer(serializers.ModelSerializer):
    days_until = serializers.SerializerMethodField()

    class Meta:
        model = Member
        fields = (
            'id', 
            'sadc_member_id', 
            'first_name', 
            'last_name', 
            'days_until',
        )

    def get_days_until(self, obj):
        """Calculate the days until the birthday."""
        today = timezone.now().date()
        birth_date = obj.birth_date

        next_birthday = birth_date.replace(year=today.year)

        if next_birthday < today:
            next_birthday = next_birthday.replace(year=today.year + 1)

        days_until = (next_birthday - today).days
        return days_until