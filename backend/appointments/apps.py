"""
Configuración de la aplicación de citas.
"""
from django.apps import AppConfig


class AppointmentsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'appointments'
    verbose_name = 'Gestión de Citas'
