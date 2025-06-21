from rest_framework import serializers
from ..models.member_model import Member
from ...tenant.models.mltc_model import MLTC
from django.utils import timezone
from .mixins import DaysUntilMixin

class MemberNameSerializer(serializers.ModelSerializer):
    sadc_member_id = serializers.ReadOnlyField(source='member.sadc_member_id')
    alt_name = serializers.ReadOnlyField(source='member.alt_name')
    member_name = serializers.ReadOnlyField(source='member.formal_name')

    class Meta:
        abstract = True
    
class MemberSerializer(serializers.ModelSerializer):
    active = serializers.BooleanField(required=False, default=True) # Active default to True
    
    mltc = serializers.PrimaryKeyRelatedField(
        queryset=MLTC.objects.all(),
        required=False,
        allow_null=True
    )

    class Meta:
        model = Member
        exclude = ['created_at', 'updated_at']

class MemberListSerializer(serializers.ModelSerializer):
    sadc = serializers.ReadOnlyField(source='sadc_name')
    new = serializers.ReadOnlyField(source='is_new') 
    
    mltc_member_id = serializers.ReadOnlyField(source='active_auth.mltc_member_id')
    mltc_name = serializers.ReadOnlyField(source='active_auth.mltc.name')
    dx_code = serializers.ReadOnlyField(source='active_auth.dx_code')
    start_date = serializers.ReadOnlyField(source='active_auth.start_date')
    end_date = serializers.ReadOnlyField(source='active_auth.end_date')
    schedule = serializers.ReadOnlyField(source='active_auth.schedule')

    sdc_auth_id = serializers.SerializerMethodField()
    transportation_auth_id = serializers.SerializerMethodField()

    class Meta:
        model = Member
        fields = (
            'id',
            'sadc_member_id',
            'photo',
            'first_name',
            'last_name',
            'alt_name',
            'birth_date',
            'phone',
            'gender',
            'address',
            'active',
            'sadc',
            'new',
            'mltc_member_id',
            'mltc_name',
            'dx_code',
            'start_date',
            'end_date',
            'schedule',
            'sdc_auth_id',
            'transportation_auth_id',
        )

    def get_service_auth_id(self, obj, service_type):
        auth = obj.active_auth
        if not auth:
            return None
        service = auth.services.filter(service_type=service_type).first()
        return service.auth_id if service else None

    def get_sdc_auth_id(self, obj):
        return self.get_service_auth_id(obj, 'sdc')

    def get_transportation_auth_id(self, obj):
        return self.get_service_auth_id(obj, 'transportation')

class MemberDeletedSerializer(serializers.ModelSerializer):
    days_until_30 = serializers.ReadOnlyField()
    member_name = serializers.ReadOnlyField(source='formal_name')

    class Meta:
        model = Member
        fields = (
            'id',
            'alt_name',
            'last_name',
            'first_name',
            'member_name',
            'photo',
            'birth_date', 
            'days_until_30',
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