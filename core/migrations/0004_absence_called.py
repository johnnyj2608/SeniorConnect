# Generated by Django 4.2.17 on 2025-05-27 17:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_alter_contact_contact_type'),
    ]

    operations = [
        migrations.AddField(
            model_name='absence',
            name='called',
            field=models.BooleanField(default=False),
        ),
    ]
