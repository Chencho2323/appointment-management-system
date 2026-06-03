"""
Vistas de autenticación para registro de usuarios y logout.
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


@api_view(['POST'])
@permission_classes([AllowAny])
def register_operator(request):
    """
    Registrar un nuevo usuario con rol de operador.
    Los operadores tienen permisos limitados en el sistema.
    """
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response(
            {'error': 'Usuario y contraseña son requeridos'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Verificar si el usuario ya existe
    if User.objects.filter(username=username).exists():
        return Response(
            {'error': 'El usuario ya existe'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        with transaction.atomic():
            # Crear el usuario
            user = User.objects.create_user(
                username=username,
                password=password
            )
            
            # Asignar permisos básicos de operador
            # Por defecto, los usuarios nuevos no tienen permisos especiales
            # Se pueden agregar permisos específicos según sea necesario
            
            return Response({
                'message': 'Usuario registrado exitosamente',
                'username': user.username
            }, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response(
            {'error': f'Error al registrar usuario: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    """
    Cerrar sesión del usuario blacklisteando el refresh token.
    """
    try:
        refresh_token = request.data.get('refresh')
        
        if not refresh_token:
            return Response(
                {'error': 'El refresh token es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Blacklistear el refresh token
        token = RefreshToken(refresh_token)
        token.blacklist()
        
        return Response(
            {'message': 'Sesión cerrada exitosamente'},
            status=status.HTTP_200_OK
        )
    
    except Exception as e:
        return Response(
            {'error': f'Error al cerrar sesión: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
