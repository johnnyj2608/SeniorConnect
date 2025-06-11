from rest_framework import serializers
from ..models.member_model import Member, Language
from ..models.authorization_model import MLTC
from django.utils import timezone
from .mixins import DaysUntilMixin

class MemberNameSerializer(serializers.ModelSerializer):
    sadc_member_id = serializers.ReadOnlyField(source='member.sadc_member_id')
    alt_name = serializers.ReadOnlyField(source='member.alt_name')
    member_name = serializers.SerializerMethodField()

    class Meta:
        abstract = True

    def get_member_name(self, obj):
        member = obj.member
        if member:
            return f"{member.last_name}, {member.first_name}"
        return None

class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = '__all__'

class MemberSerializer(serializers.ModelSerializer):
    active = serializers.BooleanField(required=False, default=True)
    
    
class MemberSerializer(serializers.ModelSerializer):
    active = serializers.BooleanField(required=False, default=True)
    
    language = serializers.PrimaryKeyRelatedField(
        queryset=Language.objects.all(),
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
    mltc = serializers.PrimaryKeyRelatedField(
        queryset=MLTC.objects.all(),
        required=False,
        allow_null=True
    )

    class Meta:
        model = Member
        exclude = ['created_at', 'updated_at']

class MemberListSerializer(serializers.ModelSerializer):
    mltc = serializers.ReadOnlyField(source='active_auth.mltc.name')
    schedule = serializers.ReadOnlyField(source='active_auth.schedule')

    class Meta:
        model = Member
        fields =(
            'id',
            'sadc_member_id', 
            'photo',
            'first_name', 
            'last_name', 
            'alt_name',
            'birth_date', 
            'phone',
            'active',
            'mltc',
            'schedule',
        )

class MemberBirthdaySerializer(DaysUntilMixin, serializers.ModelSerializer):
    days_until = serializers.SerializerMethodField()
    age_turning = serializers.SerializerMethodField()

    class Meta:
        model = Member
        fields = (
            'id', 
            'sadc_member_id', 
            'first_name', 
            'last_name', 
            'alt_name',
            'days_until',
            'age_turning',
        )

    def get_target_date(self, obj):
        today = timezone.now().date()
        next_birthday = obj.birth_date.replace(year=today.year)
        if next_birthday < today:
            next_birthday = next_birthday.replace(year=today.year + 1)
        return next_birthday
    
    def get_age_turning(self, obj):
        today = timezone.now().date()
        birth_date = obj.birth_date
        next_birthday_year = today.year
        next_birthday = birth_date.replace(year=next_birthday_year)
        if next_birthday < today:
            next_birthday_year += 1
            next_birthday = birth_date.replace(year=next_birthday_year)
        return next_birthday_year - birth_date.year