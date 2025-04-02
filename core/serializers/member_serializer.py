from rest_framework import serializers
from ..models.member_model import Member, Language

class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = '__all__'

class MemberSerializer(serializers.ModelSerializer):
    language = LanguageSerializer()

    class Meta:
        model = Member
        fields = '__all__'