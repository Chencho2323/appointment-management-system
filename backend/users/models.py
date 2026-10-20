"""
Modelo de usuario personalizado para el sistema de gestión de citas.
"""
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    """
    Modelo de usuario personalizado que extiende AbstractUser de Django.
    Permite agregar campos adicionales en el futuro si es necesario.
    """
    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
