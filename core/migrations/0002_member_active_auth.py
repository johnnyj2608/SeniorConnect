# Generated by Django 4.2.17 on 2025-05-14 14:51

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='member',
            name='active_auth',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='active_for_member', to='core.authorization'),
        ),
    ]
