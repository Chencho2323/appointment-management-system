"""
Modelos para la aplicación de citas.
"""
import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from django.utils import timezone

User = get_user_model()


class Appointment(models.Model):
    """
    Modelo que representa una cita de entrega.
    """
    STATUS_CHOICES = [
        ('Programada', 'Programada'),
        ('En Proceso', 'En Proceso'),
        ('Entregada', 'Entregada'),
        ('Cancelada', 'Cancelada'),
    ]

    SUPPLIER_CHOICES = [
        ('A', 'A'),
        ('B', 'B'),
        ('C', 'C'),
    ]

    PRODUCT_LINE_CHOICES = [
        ('Camisetas', 'Camisetas'),
        ('Pantalones', 'Pantalones'),
        ('Zapatos', 'Zapatos'),
        ('Accesorios', 'Accesorios'),
    ]

    # Campo UUID como primary key
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Identificador único de la cita"
    )

    # Campos principales
    scheduled_at = models.DateTimeField(
        help_text="Fecha y hora programada para la entrega"
    )
    delivered_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Fecha y hora real de entrega (requerido cuando estado es 'Entregada')"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='Programada',
        db_index=True,
        help_text="Estado actual de la cita"
    )
    
    # Información de proveedor y producto
    supplier = models.CharField(
        max_length=1,
        choices=SUPPLIER_CHOICES,
        db_index=True,
        help_text="Proveedor (A, B o C)"
    )
    product_line = models.CharField(
        max_length=50,
        choices=PRODUCT_LINE_CHOICES,
        db_index=True,
        help_text="Línea de producto"
    )
    
    # Campos adicionales
    observations = models.TextField(
        blank=True,
        help_text="Observaciones adicionales sobre la cita"
    )
    
    # Metadatos
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_appointments',
        help_text="Usuario que creó la cita"
    )
    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='updated_appointments',
        help_text="Usuario que actualizó la cita por última vez"
    )

    class Meta:
        ordering = ['-scheduled_at']
        indexes = [
            models.Index(fields=['scheduled_at']),
            models.Index(fields=['status', 'scheduled_at']),
            models.Index(fields=['supplier', 'status']),
            models.Index(fields=['product_line', 'status']),
        ]

    def __str__(self):
        return f"{self.supplier} - {self.product_line} ({self.status}) - {self.scheduled_at}"

    def clean(self):
        """
        Validar reglas de negocio antes de guardar.
        """
        from django.core.exceptions import ValidationError
        
        # Regla 1: No se puede crear cita con fecha pasada
        if self.scheduled_at and self.scheduled_at < timezone.now():
            raise ValidationError({
                'scheduled_at': 'No se puede crear una cita con fecha en el pasado.'
            })
        
        # Regla 2: El estado 'Entregada' requiere delivered_at
        if self.status == 'Entregada' and not self.delivered_at:
            raise ValidationError({
                'delivered_at': 'El campo delivered_at es requerido cuando el estado es "Entregada".'
            })
        
        # Regla 3: delivered_at debe ser posterior a scheduled_at
        if self.delivered_at and self.scheduled_at and self.delivered_at < self.scheduled_at:
            raise ValidationError({
                'delivered_at': 'La fecha de entrega debe ser posterior a la fecha programada.'
            })
        
        # Regla 4: Validar transiciones de estado (solo para actualizaciones)
        if self.pk:
            try:
                old_status = Appointment.objects.get(pk=self.pk).status
                valid_transitions = {
                    'Programada': ['En Proceso', 'Cancelada'],
                    'En Proceso': ['Entregada', 'Cancelada'],
                    'Entregada': [],  # Estado final
                    'Cancelada': [],  # Estado final
                }
                
                if old_status != self.status and self.status not in valid_transitions.get(old_status, []):
                    raise ValidationError({
                        'status': f'Transición de estado no válida: {old_status} → {self.status}'
                    })
            except Appointment.DoesNotExist:
                # Si el objeto no existe, es una nueva creación, no validar transiciones
                pass

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
