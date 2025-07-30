from rest_framework import serializers
from ..models.gifted_model import Gifted

class GiftedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gifted
        exclude = ['updated_at']

class GiftedMemberSerializer(serializers.ModelSerializer):
    sadc_member_id = serializers.IntegerField(source='member.sadc_member_id')
    formal_name = serializers.CharField(source='member.formal_name')
    birth_date = serializers.DateField(source='member.birth_date')
    gender = serializers.CharField(source='member.gender')

    class Meta:
        model = Gifted
        fields = ['sadc_member_id', 'formal_name', 'birth_date', 'gender']
