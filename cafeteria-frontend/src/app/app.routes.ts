import { Routes } from '@angular/router';
import { Inicio } from './components/inicio/inicio';
import { Menu } from './components/menu/menu';
import { Carrito } from './components/carrito/carrito';
import { Asistente } from './components/asistente/asistente';
import { Admin } from './components/admin/admin';
import { EstadoPedido } from './components/estado-pedido/estado-pedido';

export const routes: Routes = [
  { path: '', component: Inicio },
  { path: 'menu', component: Menu },
  { path: 'carrito', component: Carrito },
  { path: 'asistente', component: Asistente },
  { path: 'admin', component: Admin },
  { path: 'estado-pedido', component: EstadoPedido },
  { path: '**', redirectTo: '' }
];