"""
Configuración de admin para la aplicación de citas.
"""
from django.contrib import admin
from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    """Interfaz de admin para el modelo Appointment."""
    
    list_display = [
        'id',
        'supplier',
        'product_line',
        'status',
        'scheduled_at',
        'delivered_at',
        'created_by',
    ]
    
    list_filter = [
        'status',
        'supplier',
        'product_line',
        'scheduled_at',
        'created_at',
    ]
    
    search_fields = [
        'supplier',
        'product_line',
        'observations',
    ]
    
    readonly_fields = [
        'created_at',
        'updated_at',
        'created_by',
        'updated_by',
    ]
    
    fieldsets = (
        ('Información de la Cita', {
            'fields': (
                'scheduled_at',
                'delivered_at',
                'status',
            )
        }),
        ('Proveedor y Producto', {
            'fields': (
                'supplier',
                'product_line',
            )
        }),
        ('Adicional', {
            'fields': ('observations',)
        }),
        ('Metadatos', {
            'fields': (
                'created_at',
                'updated_at',
                'created_by',
                'updated_by',
            ),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        """Establecer created_by y updated_by automáticamente."""
        if not change:
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)
