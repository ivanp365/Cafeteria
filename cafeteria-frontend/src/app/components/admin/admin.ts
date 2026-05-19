import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-admin',
  imports: [CommonModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class Admin implements OnInit {
  pedidos: any[] = [];
  productos: any[] = [];
  cargando = true;
  pedidoAEliminar: number | null = null;
  pedidoDetalle: any = null;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.cargarPedidos();
    this.api.getProductos().subscribe(p => this.productos = p);
  }

  cargarPedidos() {
    this.cargando = true;
    this.api.getPedidos().subscribe(p => {
      this.pedidos = p.reverse();
      this.cargando = false;
    });
  }

  verPedido(pedido: any) {
    this.pedidoDetalle = pedido;
  }

  cerrarDetalle() {
    this.pedidoDetalle = null;
  }

  confirmarEliminar(id: number) {
    this.pedidoAEliminar = id;
  }

  cancelarEliminar() {
    this.pedidoAEliminar = null;
  }

  eliminarPedido() {
    if (!this.pedidoAEliminar) return;
    this.api.eliminarPedido(this.pedidoAEliminar).subscribe({
      next: () => {
        this.pedidos = this.pedidos.filter(p => p.id !== this.pedidoAEliminar);
        this.pedidoAEliminar = null;
      },
      error: () => this.pedidoAEliminar = null
    });
  }

  get totalVentas() {
    return this.pedidos.reduce((sum, p) => sum + parseFloat(p.total || 0), 0);
  }

  formatPrecio(valor: any): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(parseFloat(valor) || 0);
  }

  formatFecha(fecha: any): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleString('es-CO');
  }
}