from rest_framework import serializers
from ..models.contact_model import Contact

class ContactSerializer(serializers.ModelSerializer):
    contact_type = serializers.ChoiceField(choices=Contact.CONTACT_TYPES)
    relationship_type = serializers.ChoiceField(
        choices=Contact.RELATIONSHIP_TYPES, required=False, allow_null=True
    )

    class Meta:
        model = Contact
        exclude = ['created_at', 'updated_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['contact_type'] = instance.get_contact_type_display()
        if instance.relationship_type:
            data['relationship_type'] = instance.get_relationship_type_display()
        else:
            data['relationship_type'] = None
        return data
