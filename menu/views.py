import json
import urllib.request
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Categoria, Producto, Pedido
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
def asistente_ia(request):
    mensaje = request.data.get('mensaje', '')
    productos = list(Producto.objects.select_related('categoria').values(
        'nombre', 'precio', 'categoria__nombre'
    ))
    
    menu_texto = "\n".join([
        f"- {p['nombre']} (${p['precio']}) - Categoría: {p['categoria__nombre']}"
        for p in productos
    ])
    
    prompt = f"""Eres el asistente amigable de una cafetería. 
El menú disponible es:
{menu_texto}

El cliente dice: "{mensaje}"

Responde de forma amigable, breve y recomienda productos específicos del menú."""

    data = json.dumps({
        "model": "claude-sonnet-4-20250514",
        "max_tokens": 300,
        "messages": [{"role": "user", "content": prompt}]
    }).encode('utf-8')
    
    req = urllib.request.Request(
        'https://api.anthropic.com/v1/messages',
        data=data,
        headers={
            'Content-Type': 'application/json',
            'x-api-key': 'TU_API_KEY_AQUI',
            'anthropic-version': '2023-06-01'
        }
    )
    
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read())
        respuesta = result['content'][0]['text']
    
    return Response({'respuesta': respuesta})