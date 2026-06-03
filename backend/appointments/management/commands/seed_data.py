"""
Comando de management para cargar datos de prueba en la base de datos.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta, datetime
from appointments.models import Appointment

User = get_user_model()


class Command(BaseCommand):
    help = 'Cargar la base de datos con datos de prueba'

    def handle(self, *args, **options):
        """Crear usuarios y citas de prueba."""
        self.stdout.write('Seeding database with test data...')

        # Crear usuarios de prueba
        users_data = [
            {
                'username': 'admin',
                'email': 'admin@example.com',
                'password': 'admin123',
                'first_name': 'Admin',
                'last_name': 'User',
                'is_superuser': True,
                'is_staff': True,
            },
            {
                'username': 'manager',
                'email': 'manager@example.com',
                'password': 'manager123',
                'first_name': 'Manager',
                'last_name': 'User',
                'is_superuser': False,
                'is_staff': True,
            },
            {
                'username': 'operator',
                'email': 'operator@example.com',
                'password': 'operator123',
                'first_name': 'Operator',
                'last_name': 'User',
                'is_superuser': False,
                'is_staff': False,
            },
        ]

        users = []
        for user_data in users_data:
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults={
                    'email': user_data['email'],
                    'first_name': user_data['first_name'],
                    'last_name': user_data['last_name'],
                    'is_superuser': user_data['is_superuser'],
                    'is_staff': user_data['is_staff'],
                }
            )
            if created:
                user.set_password(user_data['password'])
                user.save()
                self.stdout.write(f'Created user: {user.username}')
            else:
                self.stdout.write(f'User already exists: {user.username}')
            users.append(user)

        # Crear citas de prueba
        suppliers = ['A', 'B', 'C']
        product_lines = ['Camisetas', 'Pantalones', 'Zapatos', 'Accesorios']
        statuses = ['Programada', 'En Proceso', 'Entregada', 'Cancelada']

        base_date = timezone.now() + timedelta(days=1)
        appointments_created = 0

        for i in range(20):
            scheduled_at = base_date + timedelta(days=i % 10, hours=(i * 2) % 24)
            
            # Establecer delivered_at para estado 'Entregada'
            status = statuses[i % len(statuses)]
            delivered_at = None
            if status == 'Entregada':
                delivered_at = scheduled_at + timedelta(hours=2 + (i % 3))
            
            appointment = Appointment.objects.create(
                scheduled_at=scheduled_at,
                delivered_at=delivered_at,
                status=status,
                supplier=suppliers[i % len(suppliers)],
                product_line=product_lines[i % len(product_lines)],
                observations=f'Observación de prueba para cita {i + 1}',
                created_by=users[i % len(users)],
                updated_by=users[i % len(users)],
            )
            appointments_created += 1

        self.stdout.write(f'Created {appointments_created} appointments')
        self.stdout.write(self.style.SUCCESS('Database seeded successfully!'))
        
        # Imprimir credenciales de prueba
        self.stdout.write('\n' + '=' * 50)
        self.stdout.write('TEST CREDENTIALS:')
        self.stdout.write('=' * 50)
        for user_data in users_data:
            self.stdout.write(f"Username: {user_data['username']}")
            self.stdout.write(f"Password: {user_data['password']}")
            self.stdout.write('-' * 50)
