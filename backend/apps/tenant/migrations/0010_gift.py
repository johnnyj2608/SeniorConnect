# Generated by Django 4.2.17 on 2025-07-13 18:23

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('tenant', '0009_snapshot_name'),
    ]

    operations = [
        migrations.CreateModel(
            name='Gift',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50)),
                ('expires_at', models.DateField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('mltc', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='gifts', to='tenant.mltc')),
            ],
            options={
                'ordering': ['expires_at', 'created_at'],
            },
        ),
    ]
