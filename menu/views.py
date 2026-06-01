from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django_filters.rest_framework import DjangoFilterBackend
from .models import Categoria, Producto, Pedido, PedidoProducto
from .serializers import CategoriaSerializer, ProductoSerializer, PedidoSerializer


class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer


class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['categoria']


class PedidoViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer


@api_view(['POST'])
def login_admin(request):
    username = request.data.get('username', '')
    password = request.data.get('password', '')
    user = authenticate(username=username, password=password)
    if user is not None and user.is_staff:
        return Response({'ok': True, 'mensaje': 'Bienvenido admin'})
    return Response({'ok': False, 'mensaje': 'Credenciales incorrectas'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
def crear_pedido(request):
    cliente = request.data.get('cliente', 'Anonimo')
    total = request.data.get('total', 0)
    items = request.data.get('items', [])

    pedido = Pedido.objects.create(cliente=cliente, total=total)

    for item in items:
        try:
            producto = Producto.objects.get(id=item['producto_id'])
            cantidad = item['cantidad']

            if producto.stock >= cantidad:
                producto.stock -= cantidad
                producto.save()
            else:
                pedido.delete()
                return Response(
                    {'error': f'Stock insuficiente para {producto.nombre}. Stock disponible: {producto.stock}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            PedidoProducto.objects.create(
                pedido=pedido,
                producto=producto,
                cantidad=cantidad,
                precio_unitario=item['precio_unitario']
            )
        except Producto.DoesNotExist:
            pass

    return Response({
        'id': pedido.id,
        'mensaje': 'Pedido creado exitosamente',
        'total': str(pedido.total)
    }, status=status.HTTP_201_CREATED)