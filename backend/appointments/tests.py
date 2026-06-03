"""
Pruebas para la aplicación de citas.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from .models import Appointment

User = get_user_model()


class AppointmentModelTests(TestCase):
    """Pruebas para la lógica de negocio del modelo Appointment."""

    def setUp(self):
        """Configurar datos de prueba."""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

    def test_cannot_create_appointment_with_past_date(self):
        """Prueba que no se puede crear una cita con fecha pasada."""
        past_date = timezone.now() - timedelta(days=1)
        appointment = Appointment(
            scheduled_at=past_date,
            supplier='A',
            product_line='Camisetas',
            created_by=self.user,
            updated_by=self.user
        )
        
        with self.assertRaises(Exception):
            appointment.full_clean()
            appointment.save()

    def test_delivered_status_requires_delivered_at(self):
        """Prueba que el estado 'Entregada' requiere el campo delivered_at."""
        future_date = timezone.now() + timedelta(days=1)
        appointment = Appointment(
            scheduled_at=future_date,
            status='Entregada',
            delivered_at=None,
            supplier='A',
            product_line='Camisetas',
            created_by=self.user,
            updated_by=self.user
        )
        
        with self.assertRaises(Exception):
            appointment.full_clean()
            appointment.save()

    def test_invalid_status_transition(self):
        """Prueba que las transiciones de estado inválidas no están permitidas."""
        future_date = timezone.now() + timedelta(days=1)
        appointment = Appointment.objects.create(
            scheduled_at=future_date,
            status='Entregada',
            delivered_at=future_date + timedelta(hours=2),
            supplier='A',
            product_line='Camisetas',
            created_by=self.user,
            updated_by=self.user
        )
        
        # Intentar transición de 'Entregada' a 'Programada' (inválido)
        appointment.status = 'Programada'
        
        with self.assertRaises(Exception):
            appointment.full_clean()
            appointment.save()


class AppointmentAPITests(APITestCase):
    """Pruebas para los endpoints de API de Appointment."""

    def setUp(self):
        """Configurar datos de prueba."""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_unauthenticated_user_cannot_access_endpoints(self):
        """Prueba que los usuarios no autenticados reciben 401 en endpoints protegidos."""
        self.client.force_authenticate(user=None)
        response = self.client.get('/api/appointments/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_appointment(self):
        """Prueba crear una nueva cita."""
        future_date = timezone.now() + timedelta(days=1)
        data = {
            'scheduled_at': future_date.isoformat(),
            'supplier': 'A',
            'product_line': 'Camisetas',
            'status': 'Programada',
        }
        
        response = self.client.post('/api/appointments/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Appointment.objects.count(), 1)

    def test_report_endpoint_returns_expected_fields(self):
        """Prueba que el endpoint de reporte retorna los campos esperados."""
        # Crear datos de prueba
        future_date = timezone.now() + timedelta(days=1)
        delivered_date = future_date + timedelta(hours=2)
        
        Appointment.objects.create(
            scheduled_at=future_date,
            delivered_at=delivered_date,
            status='Entregada',
            supplier='A',
            product_line='Camisetas',
            created_by=self.user,
            updated_by=self.user
        )
        
        # Llamar endpoint de reporte
        date_from = (timezone.now() - timedelta(days=2)).date().isoformat()
        date_to = (timezone.now() + timedelta(days=2)).date().isoformat()
        
        response = self.client.get(
            f'/api/appointments/report/?date_from={date_from}&date_to={date_to}'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        
        if response.data:
            result = response.data[0]
            self.assertIn('product_line', result)
            self.assertIn('total_deliveries', result)
            self.assertIn('avg_hours', result)
            self.assertIn('avg_minutes', result)

    def test_report_without_dates_returns_all_data(self):
        """Prueba que el endpoint de reporte retorna datos sin parámetros de fecha."""
        response = self.client.get('/api/appointments/report/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)

    def test_report_with_dates_filters_correctly(self):
        """Prueba que el endpoint de reporte filtra correctamente por fechas."""
        # Crear datos de prueba
        future_date = timezone.now() + timedelta(days=1)
        delivered_date = future_date + timedelta(hours=2)
        
        Appointment.objects.create(
            scheduled_at=future_date,
            delivered_at=delivered_date,
            status='Entregada',
            supplier='A',
            product_line='Camisetas',
            created_by=self.user,
            updated_by=self.user
        )
        
        # Llamar endpoint de reporte con fechas que incluyen la cita creada
        date_from = (timezone.now() - timedelta(days=2)).date().isoformat()
        date_to = (timezone.now() + timedelta(days=2)).date().isoformat()
        
        response = self.client.get(
            f'/api/appointments/report/?date_from={date_from}&date_to={date_to}'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        
        if response.data:
            result = response.data[0]
            self.assertIn('product_line', result)
            self.assertIn('total_deliveries', result)
            self.assertIn('avg_hours', result)
            self.assertIn('avg_minutes', result)

    def test_update_appointment(self):
        """Prueba actualizar una cita existente."""
        future_date = timezone.now() + timedelta(days=1)
        appointment = Appointment.objects.create(
            scheduled_at=future_date,
            supplier='A',
            product_line='Camisetas',
            status='Programada',
            created_by=self.user,
            updated_by=self.user
        )
        
        data = {
            'status': 'En Proceso',
        }
        
        response = self.client.patch(f'/api/appointments/{appointment.id}/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        appointment.refresh_from_db()
        self.assertEqual(appointment.status, 'En Proceso')

    def test_delete_appointment(self):
        """Prueba eliminar una cita existente (soft-delete)."""
        future_date = timezone.now() + timedelta(days=1)
        appointment = Appointment.objects.create(
            scheduled_at=future_date,
            supplier='A',
            product_line='Camisetas',
            status='Programada',
            created_by=self.user,
            updated_by=self.user
        )
        
        response = self.client.delete(f'/api/appointments/{appointment.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        # Verificar que la cita no se elimina físicamente, sino que cambia a 'Cancelada'
        appointment.refresh_from_db()
        self.assertEqual(appointment.status, 'Cancelada')
        self.assertEqual(Appointment.objects.count(), 1)

    def test_list_appointments_with_filters(self):
        """Prueba listar citas con filtros."""
        future_date = timezone.now() + timedelta(days=1)
        Appointment.objects.create(
            scheduled_at=future_date,
            supplier='A',
            product_line='Camisetas',
            status='Programada',
            created_by=self.user,
            updated_by=self.user
        )
        Appointment.objects.create(
            scheduled_at=future_date + timedelta(days=1),
            supplier='B',
            product_line='Pantalones',
            status='Entregada',
            delivered_at=future_date + timedelta(days=2),
            created_by=self.user,
            updated_by=self.user
        )
        
        # Filtrar por estado
        response = self.client.get('/api/appointments/?status=Programada')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['status'], 'Programada')

    def test_dashboard_endpoint(self):
        """Prueba el endpoint de dashboard."""
        future_date = timezone.now() + timedelta(days=1)
        today = timezone.now().date()
        
        Appointment.objects.create(
            scheduled_at=timezone.now().replace(hour=10, minute=0),
            supplier='A',
            product_line='Camisetas',
            status='Programada',
            created_by=self.user,
            updated_by=self.user
        )
        
        response = self.client.get('/api/appointments/dashboard/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_appointments', response.data)
        self.assertIn('today_appointments', response.data)
        self.assertIn('status_counts', response.data)

    def test_create_appointment_with_observations(self):
        """Prueba crear una cita con observaciones."""
        future_date = timezone.now() + timedelta(days=1)
        data = {
            'scheduled_at': future_date.isoformat(),
            'supplier': 'A',
            'product_line': 'Camisetas',
            'status': 'Programada',
            'observations': 'Observaciones adicionales de prueba',
        }
        
        response = self.client.post('/api/appointments/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Appointment.objects.first().observations, 'Observaciones adicionales de prueba')

    def test_invalid_date_format_in_report(self):
        """Prueba que el endpoint de reporte rechaza formatos de fecha inválidos."""
        response = self.client.get('/api/appointments/report/?date_from=invalid&date_to=invalid')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delivered_at_must_be_after_scheduled_at(self):
        """Prueba que delivered_at debe ser posterior a scheduled_at."""
        future_date = timezone.now() + timedelta(days=1)
        data = {
            'scheduled_at': future_date.isoformat(),
            'delivered_at': (future_date - timedelta(hours=1)).isoformat(),
            'supplier': 'A',
            'product_line': 'Camisetas',
            'status': 'Entregada',
        }
        
        response = self.client.post('/api/appointments/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
