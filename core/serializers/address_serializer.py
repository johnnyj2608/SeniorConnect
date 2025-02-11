from rest_framework.serializers import ModelSerializer
from ..models.address_model import Address, City, State, ZipCode

class CitySerializer(ModelSerializer):
    class Meta:
        model = City
        fields = '__all__'

class StateSerializer(ModelSerializer):
    class Meta:
        model = State
        fields = '__all__'

class ZipCodeSerializer(ModelSerializer):
    class Meta:
        model = ZipCode
        fields = '__all__'

class AddressSerializer(ModelSerializer):
    city = CitySerializer()
    state = StateSerializer()
    zip_code = ZipCodeSerializer()

    class Meta:
        model = Address
        fields = '__all__'