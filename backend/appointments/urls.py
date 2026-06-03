"""
Configuración de URL para la aplicación de citas.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AppointmentViewSet
from .auth_views import register_operator, logout_user

router = DefaultRouter()
router.register(r'', AppointmentViewSet, basename='appointment')

urlpatterns = [
    path('', include(router.urls)),
    path('register/operator/', register_operator, name='register_operator'),
    path('logout/', logout_user, name='logout'),
]
