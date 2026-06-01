import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-admin',
  imports: [CommonModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class Admin implements OnInit, AfterViewInit {
  @ViewChild('graficaVentas') graficaVentas!: ElementRef;
  @ViewChild('graficaProductos') graficaProductos!: ElementRef;
  @ViewChild('graficaCategorias') graficaCategorias!: ElementRef;

  pedidos: any[] = [];
  productos: any[] = [];
  cargando = true;
  pedidoAEliminar: number | null = null;
  pedidoDetalle: any = null;
  hoy = new Date();
  chartVentas: any;
  chartProductos: any;
  chartCategorias: any;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.cargarPedidos();
    this.api.getProductos().subscribe(p => this.productos = p);
  }

  ngAfterViewInit() {}

  cargarPedidos() {
    this.cargando = true;
    this.api.getPedidos().subscribe(p => {
      this.pedidos = p.reverse();
      this.cargando = false;
      setTimeout(() => this.initGraficas(), 300);
    });
  }

  initGraficas() {
    if (typeof window === 'undefined') return;
    this.graficaVentasPorDia();
    this.graficaProductosMasVendidos();
    this.graficaPorCategorias();
  }

  graficaVentasPorDia() {
    const ventas: { [key: string]: number } = {};
    this.pedidos.forEach(p => {
      const fecha = new Date(p.fecha).toLocaleDateString('es-CO');
      ventas[fecha] = (ventas[fecha] || 0) + parseFloat(p.total || 0);
    });

    const labels = Object.keys(ventas).slice(-7);
    const data = labels.map(l => ventas[l]);

    if (this.chartVentas) this.chartVentas.destroy();
    this.chartVentas = new Chart(this.graficaVentas.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Ventas (COP)',
          data,
          borderColor: '#c8a165',
          backgroundColor: 'rgba(200,161,101,0.15)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#c8a165',
          pointRadius: 6,
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#f0ebe3' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  graficaProductosMasVendidos() {
    const conteo: { [key: string]: number } = {};
    this.pedidos.forEach(p => {
      p.productos?.forEach((item: any) => {
        const nombre = item.producto_nombre || 'Desconocido';
        conteo[nombre] = (conteo[nombre] || 0) + (item.cantidad || 1);
      });
    });

    const sorted = Object.entries(conteo).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const labels = sorted.map(e => e[0]);
    const data = sorted.map(e => e[1]);

    if (this.chartProductos) this.chartProductos.destroy();
    this.chartProductos = new Chart(this.graficaProductos.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Unidades vendidas',
          data,
          backgroundColor: ['#c8a165', '#a07840', '#d4b483', '#8b6535', '#e8c99a'],
          borderRadius: 8,
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#f0ebe3' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  graficaPorCategorias() {
    const conteo: { [key: string]: number } = {};
    this.productos.forEach(p => {
      const cat = p.categoria_nombre || 'Sin categoría';
      conteo[cat] = (conteo[cat] || 0) + 1;
    });

    const labels = Object.keys(conteo);
    const data = Object.values(conteo);

    if (this.chartCategorias) this.chartCategorias.destroy();
    this.chartCategorias = new Chart(this.graficaCategorias.nativeElement, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: ['#c8a165', '#2d2d2d', '#a07840', '#d4b483', '#8b6535'],
          borderWidth: 0,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { padding: 16, font: { family: 'Poppins' } }
          }
        }
      }
    });
  }

  verPedido(pedido: any) { this.pedidoDetalle = pedido; }
  cerrarDetalle() { this.pedidoDetalle = null; }
  confirmarEliminar(id: number) { this.pedidoAEliminar = id; }
  cancelarEliminar() { this.pedidoAEliminar = null; }

  eliminarPedido() {
    if (!this.pedidoAEliminar) return;
    this.api.eliminarPedido(this.pedidoAEliminar).subscribe({
      next: () => {
        this.pedidos = this.pedidos.filter(p => p.id !== this.pedidoAEliminar);
        this.pedidoAEliminar = null;
        setTimeout(() => this.initGraficas(), 300);
      },
      error: () => this.pedidoAEliminar = null
    });
  }

  get totalVentas() {
    return this.pedidos.reduce((sum, p) => sum + parseFloat(p.total || 0), 0);
  }

  formatPrecio(valor: any): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(parseFloat(valor) || 0);
  }

  formatFecha(fecha: any): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleString('es-CO');
  }
}