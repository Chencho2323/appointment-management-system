"""
Vistas para la aplicación de citas.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import connection
from django.utils import timezone
from datetime import datetime
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse
from drf_spectacular.types import OpenApiTypes
from .models import Appointment
from .serializers import (
    AppointmentSerializer,
    AppointmentListSerializer,
    ReportSerializer,
)


class AppointmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar citas.
    Proporciona operaciones CRUD y acciones personalizadas.
    """
    permission_classes = [IsAuthenticated]
    queryset = Appointment.objects.all()

    def get_serializer_class(self):
        """Retornar el serializador apropiado según la acción."""
        if self.action == 'list':
            return AppointmentListSerializer
        return AppointmentSerializer

    @extend_schema(
        summary='Listar citas',
        description='Retorna una lista de citas con filtros opcionales por fecha, proveedor, línea de producto y estado.',
        parameters=[
            OpenApiParameter(
                name='date_from',
                type=OpenApiTypes.DATE,
                required=False,
                description='Fecha inicial del filtro (formato YYYY-MM-DD)'
            ),
            OpenApiParameter(
                name='date_to',
                type=OpenApiTypes.DATE,
                required=False,
                description='Fecha final del filtro (formato YYYY-MM-DD)'
            ),
            OpenApiParameter(
                name='supplier',
                type=OpenApiTypes.STR,
                required=False,
                description='Filtrar por proveedor (A, B, C)'
            ),
            OpenApiParameter(
                name='product_line',
                type=OpenApiTypes.STR,
                required=False,
                description='Filtrar por línea de producto'
            ),
            OpenApiParameter(
                name='status',
                type=OpenApiTypes.STR,
                required=False,
                description='Filtrar por estado (Programada, En Proceso, Entregada, Cancelada)'
            ),
        ],
        responses={
            200: AppointmentListSerializer,
            401: OpenApiResponse(description='No autenticado')
        },
        tags=['Citas']
    )
    def get_queryset(self):
        """
        Filtrar citas basado en parámetros de consulta.
        """
        queryset = Appointment.objects.all()

        # Filtrar por rango de fechas
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')

        if date_from:
            queryset = queryset.filter(scheduled_at__gte=date_from)
        if date_to:
            queryset = queryset.filter(scheduled_at__lte=date_to)

        # Filtrar por supplier
        supplier = self.request.query_params.get('supplier')
        if supplier:
            queryset = queryset.filter(supplier=supplier)

        # Filtrar por línea de producto
        product_line = self.request.query_params.get('product_line')
        if product_line:
            queryset = queryset.filter(product_line=product_line)

        # Filtrar por estado
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)

        return queryset

    @extend_schema(
        summary='Crear cita',
        description='Crea una nueva cita con los datos proporcionados. Valida que la fecha programada no sea en el pasado y que el estado sea válido.',
        request=AppointmentSerializer,
        responses={
            201: AppointmentSerializer,
            400: OpenApiResponse(description='Error de validación'),
            401: OpenApiResponse(description='No autenticado')
        },
        tags=['Citas']
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @extend_schema(
        summary='Obtener detalle de cita',
        description='Retorna los detalles completos de una cita específica por su ID.',
        responses={
            200: AppointmentSerializer,
            404: OpenApiResponse(description='Cita no encontrada'),
            401: OpenApiResponse(description='No autenticado')
        },
        tags=['Citas']
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        summary='Actualizar cita',
        description='Actualiza todos los campos de una cita existente. Valida transiciones de estado y fechas.',
        request=AppointmentSerializer,
        responses={
            200: AppointmentSerializer,
            400: OpenApiResponse(description='Error de validación'),
            404: OpenApiResponse(description='Cita no encontrada'),
            401: OpenApiResponse(description='No autenticado')
        },
        tags=['Citas']
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @extend_schema(
        summary='Actualizar parcialmente cita',
        description='Actualiza parcialmente los campos de una cita existente. Valida transiciones de estado y fechas.',
        request=AppointmentSerializer,
        responses={
            200: AppointmentSerializer,
            400: OpenApiResponse(description='Error de validación'),
            404: OpenApiResponse(description='Cita no encontrada'),
            401: OpenApiResponse(description='No autenticado')
        },
        tags=['Citas']
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @extend_schema(
        summary='Eliminar cita (soft-delete)',
        description='Realiza un soft-delete de la cita cambiando su estado a "Cancelada". No permite cancelar citas ya canceladas o entregadas.',
        responses={
            204: OpenApiResponse(description='Cita cancelada exitosamente'),
            400: OpenApiResponse(description='No se puede cancelar una cita con estado Cancelada o Entregada'),
            404: OpenApiResponse(description='Cita no encontrada'),
            401: OpenApiResponse(description='No autenticado')
        },
        tags=['Citas']
    )
    def destroy(self, request, *args, **kwargs):
        """
        Soft-delete: cambiar status a 'Cancelada' en lugar de eliminar físicamente.
        """
        appointment = self.get_object()

        # Verificar si ya está cancelada o entregada
        if appointment.status in ['Cancelada', 'Entregada']:
            return Response(
                {'error': f'No se puede cancelar una cita con estado "{appointment.status}"'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Cambiar status a Cancelada
        appointment.status = 'Cancelada'
        appointment.save()

        return Response(status=status.HTTP_204_NO_CONTENT)

    @extend_schema(
        summary='Obtener estadísticas del dashboard',
        description='Retorna estadísticas resumidas del dashboard incluyendo total de citas, citas de hoy, y conteos por estado.',
        responses={
            200: OpenApiResponse(description='Estadísticas del dashboard obtenidas exitosamente'),
            401: OpenApiResponse(description='No autenticado')
        },
        tags=['Citas']
    )
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """
        Obtener estadísticas resumidas del dashboard.
        """
        total_appointments = Appointment.objects.count()
        today = timezone.now().date()
        today_appointments = Appointment.objects.filter(
            scheduled_at__date=today
        ).count()

        # Contar por estado
        status_counts = {}
        for status_choice in Appointment.STATUS_CHOICES:
            status_name = status_choice[0]
            count = Appointment.objects.filter(status=status_name).count()
            status_counts[status_name] = count

        return Response({
            'total_appointments': total_appointments,
            'today_appointments': today_appointments,
            'status_counts': status_counts,
        })

    @extend_schema(
        summary='Generar reporte de tiempos de entrega',
        description='Genera un reporte en tiempo real con consulta SQL nativa que calcula el tiempo promedio de entrega agrupado por línea de producto. Se puede filtrar por rango de fechas.',
        parameters=[
            OpenApiParameter(
                name='date_from',
                type=str,
                required=False,
                description='Fecha inicial del filtro (formato YYYY-MM-DD)'
            ),
            OpenApiParameter(
                name='date_to',
                type=str,
                required=False,
                description='Fecha final del filtro (formato YYYY-MM-DD)'
            ),
        ],
        responses={
            200: OpenApiResponse(description='Reporte generado exitosamente'),
            400: OpenApiResponse(description='Error en el formato de las fechas'),
            401: OpenApiResponse(description='No autenticado')
        },
        tags=['Citas']
    )
    @action(detail=False, methods=['get'])
    def report(self, request):
        """
        Generar reporte en tiempo real con consulta SQL nativa.
        Calcula el tiempo promedio de entrega agrupado por línea de producto.
        """
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')

        # Parsear fechas si se proporcionan
        date_from_parsed = None
        date_to_parsed = None

        if date_from:
            try:
                date_from_parsed = datetime.strptime(date_from, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {'error': 'Formato de fecha inválido para date_from. Use YYYY-MM-DD'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        if date_to:
            try:
                date_to_parsed = datetime.strptime(date_to, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {'error': 'Formato de fecha inválido para date_to. Use YYYY-MM-DD'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Construir consulta SQL dinámicamente
        query = """
            SELECT
                product_line,
                COUNT(*) AS total_deliveries,
                AVG(EXTRACT(EPOCH FROM (delivered_at - scheduled_at)) / 3600) AS avg_hours
            FROM appointments_appointment
            WHERE status = 'Entregada'
        """

        params = []

        # Agregar filtros de fecha si se proporcionan
        if date_from_parsed and date_to_parsed:
            query += " AND scheduled_at BETWEEN %s AND %s"
            params.extend([date_from_parsed, date_to_parsed])
        elif date_from_parsed:
            query += " AND scheduled_at >= %s"
            params.append(date_from_parsed)
        elif date_to_parsed:
            query += " AND scheduled_at <= %s"
            params.append(date_to_parsed)

        query += " GROUP BY product_line ORDER BY product_line;"

        with connection.cursor() as cursor:
            cursor.execute(query, params)
            rows = cursor.fetchall()

        # Formatear resultados
        results = []
        for row in rows:
            product_line, total_deliveries, avg_hours = row
            avg_minutes = avg_hours * 60 if avg_hours else 0
            results.append({
                'product_line': product_line,
                'total_deliveries': total_deliveries,
                'avg_hours': round(avg_hours, 2) if avg_hours else 0,
                'avg_minutes': round(avg_minutes, 2) if avg_minutes else 0,
            })

        serializer = ReportSerializer(results, many=True)
        return Response(serializer.data)
