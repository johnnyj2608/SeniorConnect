from rest_framework import serializers
from ..models.address_model import Address, City, State, ZipCode

class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = '__all__'

class StateSerializer(serializers.ModelSerializer):
    class Meta:
        model = State
        fields = '__all__'

class ZipCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ZipCode
        fields = '__all__'

class AddressSerializer(serializers.ModelSerializer):
    city = CitySerializer()
    state = StateSerializer()
    zip_code = ZipCodeSerializer()

    class Meta:
        model = Address
        fields = '__all__'