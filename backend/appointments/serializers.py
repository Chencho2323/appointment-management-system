"""
Serializadores para la aplicación de citas.
"""
from rest_framework import serializers
from .models import Appointment
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializador para el modelo User."""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


class AppointmentSerializer(serializers.ModelSerializer):
    """Serializador para el modelo Appointment."""
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    updated_by_username = serializers.CharField(source='updated_by.username', read_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id',
            'scheduled_at',
            'delivered_at',
            'status',
            'supplier',
            'product_line',
            'observations',
            'created_at',
            'updated_at',
            'created_by',
            'updated_by',
            'created_by_username',
            'updated_by_username',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by']

    def validate(self, data):
        """
        Validar reglas de negocio.
        """
        instance = self.instance
        scheduled_at = data.get('scheduled_at')
        delivered_at = data.get('delivered_at')
        status = data.get('status')

        # Para actualizaciones parciales (PATCH), obtener valores del instance si no vienen en data
        if instance:
            scheduled_at = scheduled_at if scheduled_at is not None else instance.scheduled_at
            delivered_at = delivered_at if delivered_at is not None else instance.delivered_at
            status = status if status is not None else instance.status

        # No se puede crear cita con fecha pasada
        if scheduled_at and scheduled_at < timezone.now():
            raise serializers.ValidationError({
                'scheduled_at': 'No se puede crear una cita con fecha en el pasado.'
            })

        # El estado 'Entregada' requiere delivered_at
        if status == 'Entregada' and not delivered_at:
            raise serializers.ValidationError({
                'delivered_at': 'El campo delivered_at es requerido cuando el estado es "Entregada".'
            })

        # delivered_at debe ser posterior a scheduled_at
        if delivered_at and scheduled_at and delivered_at < scheduled_at:
            raise serializers.ValidationError({
                'delivered_at': 'La fecha de entrega debe ser posterior a la fecha programada.'
            })

        return data

    def create(self, validated_data):
        """Crear cita con el usuario actual como creador."""
        validated_data['created_by'] = self.context['request'].user
        validated_data['updated_by'] = self.context['request'].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """Actualizar cita con el usuario actual como actualizador."""
        validated_data['updated_by'] = self.context['request'].user
        return super().update(instance, validated_data)


class AppointmentListSerializer(serializers.ModelSerializer):
    """Serializador ligero para vistas de lista."""
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id',
            'scheduled_at',
            'delivered_at',
            'status',
            'supplier',
            'product_line',
            'created_by_username',
        ]


class ReportSerializer(serializers.Serializer):
    """Serializador para datos de reporte."""
    product_line = serializers.CharField()
    total_deliveries = serializers.IntegerField()
    avg_hours = serializers.FloatField()
    avg_minutes = serializers.FloatField()
