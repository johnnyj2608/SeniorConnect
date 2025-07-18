# Generated by Django 4.2.17 on 2025-06-29 14:18

import datetime
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('tenant', '0007_alter_mltc_name_alter_sadc_address_alter_sadc_email_and_more'),
        ('core', '0034_delete_enrollment'),
        ('audit', '0008_alter_auditlog_changes'),
    ]

    operations = [
        migrations.CreateModel(
            name='Enrollment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('change_type', models.CharField(choices=[('enrollment', 'Enrollment'), ('transfer', 'Transfer'), ('disenrollment', 'Disenrollment')], max_length=20)),
                ('change_date', models.DateField(default=datetime.date.today)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('member', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='core.member')),
                ('new_mltc', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='new_enrollments', to='tenant.mltc')),
                ('old_mltc', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='old_enrollments', to='tenant.mltc')),
            ],
            options={
                'ordering': ['-change_date', '-created_at'],
            },
        ),
    ]
