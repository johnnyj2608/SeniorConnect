# Generated by Django 4.2.17 on 2025-06-19 23:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0027_sadc_active_sadc_address_sadc_created_at_sadc_email_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='sadc',
            name='attendance_template',
            field=models.PositiveSmallIntegerField(default=1),
        ),
    ]
