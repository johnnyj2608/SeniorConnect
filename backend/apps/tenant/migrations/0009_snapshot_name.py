# Generated by Django 4.2.17 on 2025-07-11 22:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tenant', '0008_snapshot_pages'),
    ]

    operations = [
        migrations.AddField(
            model_name='snapshot',
            name='name',
            field=models.CharField(default='Test July 2025', max_length=50),
            preserve_default=False,
        ),
    ]
