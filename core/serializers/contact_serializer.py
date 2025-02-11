from rest_framework import serializers
from ..models.contact_model import CareManager, MemberEmergencyContact, RelationshipType, PrimaryCareProvider, Pharmacy

class RelationshipTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RelationshipType
        fields = '__all__'

class CareManagerSerializer(serializers.ModelSerializer):
    class Meta:
        model = CareManager
        fields = '__all__'

class MemberEmergencyContactSerializer(serializers.ModelSerializer):
    relationship_type = RelationshipTypeSerializer()

    class Meta:
        model = MemberEmergencyContact
        fields = '__all__'

class PrimaryCareProviderSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrimaryCareProvider
        fields = '__all__'

class PharmacySerializer(serializers.ModelSerializer):
    class Meta:
        model = Pharmacy
        fields = '__all__'
