# Generated by Django 4.2.17 on 2025-06-19 19:27

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0023_member_deleted_at'),
    ]

    operations = [
        migrations.AddField(
            model_name='member',
            name='sadc',
            field=models.ForeignKey(default='1', on_delete=django.db.models.deletion.CASCADE, related_name='members', to='core.sadc'),
            preserve_default=False,
        ),
    ]
