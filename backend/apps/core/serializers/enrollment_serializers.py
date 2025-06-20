from rest_framework import serializers
from ..models.enrollment_model import Enrollment
from ...tenant.models.mltc_model import MLTC
from .member_serializers import MemberNameSerializer

class EnrollmentSerializer(MemberNameSerializer):
    old_mltc = serializers.PrimaryKeyRelatedField(
        queryset=MLTC.objects.all(),
        allow_null=True,
        required=False
    )
    old_mltc_name = serializers.ReadOnlyField(source='old_mltc.name')

    new_mltc = serializers.PrimaryKeyRelatedField(
        queryset=MLTC.objects.all(),
        allow_null=True,
        required=False
    )
    new_mltc_name = serializers.ReadOnlyField(source='new_mltc.name')

    class Meta:
        model = Enrollment
        exclude = ['created_at']