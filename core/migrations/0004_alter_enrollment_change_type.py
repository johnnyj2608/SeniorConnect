# Generated by Django 4.2.17 on 2025-05-15 00:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_enrollment'),
    ]

    operations = [
        migrations.AlterField(
            model_name='enrollment',
            name='change_type',
            field=models.CharField(choices=[('enrollment', 'Enrollment'), ('transfer', 'Transfer'), ('disenrollment', 'Disenrollment'), ('extension', 'Extension')], max_length=20),
        ),
    ]
