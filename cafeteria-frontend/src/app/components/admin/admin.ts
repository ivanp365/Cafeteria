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

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getPedidos().subscribe(p => {
      this.pedidos = p.reverse();
      this.cargando = false;
    });
    this.api.getProductos().subscribe(p => this.productos = p);
  }

  get totalVentas() {
    return this.pedidos.reduce((sum, p) => sum + parseFloat(p.total || 0), 0);
  }

  formatPrecio(valor: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(valor);
  }

  formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleString('es-CO');
  }
}