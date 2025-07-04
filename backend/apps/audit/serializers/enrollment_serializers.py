from rest_framework import serializers
from ..models.enrollment_model import Enrollment
from backend.apps.tenant.models.mltc_model import Mltc
from backend.apps.core.serializers.member_serializers import MemberNameSerializer

class EnrollmentSerializer(MemberNameSerializer):
    old_mltc = serializers.SlugRelatedField(
        queryset=Mltc.objects.all(),
        slug_field='name',
        required=False,
        allow_null=True,
    )

    new_mltc = serializers.SlugRelatedField(
        queryset=Mltc.objects.all(),
        slug_field='name',
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Enrollment
        exclude = ['created_at']