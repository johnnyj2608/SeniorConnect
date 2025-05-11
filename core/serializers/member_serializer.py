from rest_framework import serializers
from ..models.member_model import Member, Language
from ..models.authorization_model import Authorization, MLTC
from datetime import datetime, timedelta

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
        fields = '__all__'

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
        
    def get_active_auth(self, obj):
        """Cach the active authorization for a given member."""
        if not hasattr(self, '_active_auth_cache'):
            self._active_auth_cache = {}
        
        if obj.id not in self._active_auth_cache:
            active_auth = Authorization.objects.filter(
                member=obj.id,
                active=True
            ).order_by('start_date').first()
            
            self._active_auth_cache[obj.id] = active_auth
        
        return self._active_auth_cache[obj.id]

    def get_mltc(self, obj):
        auth = self.get_active_auth(obj)
        return auth.mltc.name if auth and auth.mltc else None

    def get_schedule(self, obj):
        auth = self.get_active_auth(obj)
        return auth.schedule if auth else None

class MemberBirthdaySerializer(serializers.ModelSerializer):
    days_until = serializers.SerializerMethodField()

    class Meta:
        model = Member
        fields = ('id', 'first_name', 'last_name', 'days_until')

    def get_days_until(self, obj):
        """Calculate the days until the birthday."""
        today = datetime.today().date()
        birthday = obj.birth_date

        next_birthday = birthday.replace(year=today.year)

        days_until = (next_birthday - today).days
        return days_until