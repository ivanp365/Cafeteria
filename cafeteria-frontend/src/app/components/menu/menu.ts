import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Producto, Categoria } from '../../services/api';

@Component({
  selector: 'app-menu',
  imports: [CommonModule],
  templateUrl: './menu.html',
  styleUrl: './menu.scss'
})
export class Menu implements OnInit {
  productos: Producto[] = [];
  categorias: Categoria[] = [];
  categoriaSeleccionada: number | null = null;
  cargando = true;
  agregados: {[key: number]: boolean} = {};

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getCategorias().subscribe(cats => this.categorias = cats);
    this.cargarProductos();
  }

  cargarProductos(categoriaId?: number) {
    this.cargando = true;
    this.api.getProductos(categoriaId).subscribe(prods => {
      this.productos = prods;
      this.cargando = false;
    });
  }

  filtrar(categoriaId: number | null) {
    this.categoriaSeleccionada = categoriaId;
    this.cargarProductos(categoriaId ?? undefined);
  }

  agregar(producto: Producto) {
    this.api.agregarAlCarrito(producto);
    this.agregados[producto.id] = true;
    setTimeout(() => this.agregados[producto.id] = false, 1500);
  }

  formatPrecio(precio: string): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(parseFloat(precio));
  }
}