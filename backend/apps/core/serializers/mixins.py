from rest_framework import serializers
from django.utils import timezone

class DateRangeValidationMixin:
    def validate_date_range(self, data, start_field='start_date', end_field='end_date'):
        start = data.get(start_field)
        end = data.get(end_field)

        if start and end and end < start:
            raise serializers.ValidationError(
                f"{end_field.replace('_', ' ').capitalize()} cannot be before {start_field.replace('_', ' ')}."
            )

        return data

class DaysUntilMixin:
    def get_days_until(self, obj):
        today = timezone.now().date()
        target_date = self.get_target_date(obj)
        if target_date and target_date >= today:
            return (target_date - today).days
        return None

    def get_target_date(self, obj):
        """
        Override this in subclasses to specify which date to calculate days_until for.
        """
        return None
