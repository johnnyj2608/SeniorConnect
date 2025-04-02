from rest_framework.serializers import ModelSerializer
from ..models.member_model import Member, Language

class LanguageSerializer(ModelSerializer):
    class Meta:
        model = Language
        fields = '__all__'

class MemberSerializer(ModelSerializer):
    language = LanguageSerializer()

    class Meta:
        model = Member
        fields = '__all__'