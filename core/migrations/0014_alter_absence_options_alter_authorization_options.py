# Generated by Django 4.2.17 on 2025-05-19 03:02

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0013_rename_created_member_created_at_and_more'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='absence',
            options={'ordering': ['-start_date', '-end_date']},
        ),
        migrations.AlterModelOptions(
            name='authorization',
            options={'ordering': ['-start_date', '-end_date']},
        ),
    ]
