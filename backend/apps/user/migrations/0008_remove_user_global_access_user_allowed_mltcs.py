# Generated by Django 4.2.17 on 2025-06-12 18:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0021_remove_member_created_by'),
        ('user', '0007_alter_user_global_access'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='global_access',
        ),
        migrations.AddField(
            model_name='user',
            name='allowed_mltcs',
            field=models.ManyToManyField(blank=True, related_name='users', to='core.mltc'),
        ),
    ]
