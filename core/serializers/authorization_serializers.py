from rest_framework import serializers
from ..models.authorization_model import Authorization, MLTC, Enrollment

class MLTCSerializer(serializers.ModelSerializer):
    class Meta:
        model = MLTC
        fields = '__all__'

class AuthorizationSerializer(serializers.ModelSerializer):
    mltc = serializers.SlugRelatedField(queryset=MLTC.objects.all(), slug_field='name')

    class Meta:
        model = Authorization
        exclude = ['created_at', 'updated_at']

    def validate(self, data):
        start = data.get('start_date')
        end = data.get('end_date')

        if start and end and end < start:
            raise serializers.ValidationError("End date cannot be before start date.")
        
        return data
    
class EnrollmentSerializer(serializers.ModelSerializer):
    change_type = serializers.ChoiceField(choices=Enrollment.CHANGE_TYPES)
    member_name = serializers.SerializerMethodField()
    sadc_member_id = serializers.SerializerMethodField()

    old_mltc = serializers.SlugRelatedField(
        slug_field='name',
        queryset=MLTC.objects.all(),
        allow_null=True,
        required=False
    )
    new_mltc = serializers.SlugRelatedField(
        slug_field='name',
        queryset=MLTC.objects.all(),
        allow_null=True,
        required=False
    )

    class Meta:
        model = Enrollment
        exclude = ['created_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['change_type'] = instance.get_change_type_display()
        return data

    def get_member_name(self, obj):
        return f"{obj.member.last_name}, {obj.member.first_name}"

    def get_sadc_member_id(self, obj):
        return obj.member.sadc_member_id