from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoriaViewSet, ProductoViewSet, PedidoViewSet, asistente_ia

router = DefaultRouter()
router.register(r'categorias', CategoriaViewSet)
router.register(r'productos', ProductoViewSet)
router.register(r'pedidos', PedidoViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('ia/', asistente_ia),
]