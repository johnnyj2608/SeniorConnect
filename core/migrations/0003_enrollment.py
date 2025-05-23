# Generated by Django 4.2.17 on 2025-05-14 17:56

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_member_active_auth'),
    ]

    operations = [
        migrations.CreateModel(
            name='Enrollment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('change_type', models.CharField(choices=[('enroll', 'Enroll'), ('transfer', 'Transfer'), ('disenroll', 'Disenroll')], max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('member', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='core.member')),
                ('new_mltc', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='core.mltc')),
                ('old_mltc', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='old_mltc', to='core.mltc')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]
