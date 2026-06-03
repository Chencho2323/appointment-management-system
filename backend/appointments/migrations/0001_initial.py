# Generated migration for Appointment model

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Appointment',
            fields=[
                ('id', models.UUIDField(serialize=False, primary_key=True)),
                ('scheduled_at', models.DateTimeField(db_index=True)),
                ('delivered_at', models.DateTimeField(blank=True, null=True)),
                ('status', models.CharField(choices=[('Programada', 'Programada'), ('En Proceso', 'En Proceso'), ('Entregada', 'Entregada'), ('Cancelada', 'Cancelada')], db_index=True, default='Programada', max_length=20)),
                ('supplier', models.CharField(choices=[('A', 'A'), ('B', 'B'), ('C', 'C')], db_index=True, max_length=1)),
                ('product_line', models.CharField(choices=[('Camisetas', 'Camisetas'), ('Pantalones', 'Pantalones'), ('Zapatos', 'Zapatos'), ('Accesorios', 'Accesorios')], db_index=True, max_length=50)),
                ('observations', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='appointments_created', to='users.user')),
                ('updated_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='appointments_updated', to='users.user')),
            ],
            options={
                'verbose_name': 'Cita',
                'verbose_name_plural': 'Citas',
                'ordering': ['-scheduled_at'],
            },
        ),
    ]
