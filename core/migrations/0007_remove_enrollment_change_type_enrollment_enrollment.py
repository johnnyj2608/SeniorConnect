# Generated by Django 4.2.17 on 2025-05-15 16:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0006_rename_new_mltc_enrollment_mltc_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='enrollment',
            name='change_type',
        ),
        migrations.AddField(
            model_name='enrollment',
            name='enrollment',
            field=models.BooleanField(default=True),
        ),
    ]
