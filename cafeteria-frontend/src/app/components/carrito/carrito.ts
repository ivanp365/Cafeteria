import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService, ItemCarrito } from '../../services/api';

@Component({
  selector: 'app-carrito',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './carrito.html',
  styleUrl: './carrito.scss'
})
export class Carrito implements OnInit {
  items: ItemCarrito[] = [];
  cliente = '';
  pedidoEnviado = false;
  enviando = false;
  parseFloat = parseFloat;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.carrito$.subscribe(items => this.items = items);
  }

  get total() { return this.api.getTotalCarrito(); }

  quitar(id: number) { this.api.quitarDelCarrito(id); }

  cambiarCantidad(item: ItemCarrito, delta: number) {
    item.cantidad += delta;
    if (item.cantidad <= 0) this.quitar(item.producto.id);
  }

  formatPrecio(valor: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(valor);
  }

  confirmarPedido() {
    if (this.items.length === 0) return;
    this.enviando = true;

    const pedido = {
      cliente: this.cliente || 'Anónimo',
      total: this.total,
      items: this.items.map(i => ({
        producto_id: i.producto.id,
        cantidad: i.cantidad,
        precio_unitario: i.producto.precio
      }))
    };

    this.api.crearPedido(pedido).subscribe({
      next: () => {
        this.pedidoEnviado = true;
        this.api.limpiarCarrito();
        this.enviando = false;
      },
      error: () => {
        this.pedidoEnviado = true;
        this.api.limpiarCarrito();
        this.enviando = false;
      }
    });
  }
}