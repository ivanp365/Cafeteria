import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export interface Categoria {
  id: number;
  nombre: string;
}

export interface Producto {
  id: number;
  nombre: string;
  precio: string;
  imagen_url: string;
  categoria: number;
  categoria_nombre: string;
}

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = 'http://localhost:8000/api';
  private carritoSubject = new BehaviorSubject<ItemCarrito[]>([]);
  carrito$ = this.carritoSubject.asObservable();

  constructor(private http: HttpClient) {}

  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.base}/categorias/`);
  }

  getProductos(categoriaId?: number): Observable<Producto[]> {
    const url = categoriaId
      ? `${this.base}/productos/?categoria=${categoriaId}`
      : `${this.base}/productos/`;
    return this.http.get<Producto[]>(url);
  }

  getPedidos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/pedidos/`);
  }

  crearPedido(pedido: any): Observable<any> {
    return this.http.post(`${this.base}/pedidos/`, pedido);
  }

  consultarIA(mensaje: string): Observable<any> {
    return this.http.post(`${this.base}/ia/`, { mensaje });
  }

  agregarAlCarrito(producto: Producto) {
    const carrito = this.carritoSubject.value;
    const existente = carrito.find(i => i.producto.id === producto.id);
    if (existente) {
      existente.cantidad++;
      this.carritoSubject.next([...carrito]);
    } else {
      this.carritoSubject.next([...carrito, { producto, cantidad: 1 }]);
    }
  }

  quitarDelCarrito(productoId: number) {
    const carrito = this.carritoSubject.value.filter(i => i.producto.id !== productoId);
    this.carritoSubject.next(carrito);
  }

  limpiarCarrito() {
    this.carritoSubject.next([]);
  }

  getTotalCarrito(): number {
    return this.carritoSubject.value.reduce(
      (total, item) => total + parseFloat(item.producto.precio) * item.cantidad, 0
    );
  }

  getCantidadCarrito(): number {
    return this.carritoSubject.value.reduce((total, item) => total + item.cantidad, 0);
  }
}