import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-estado-pedido',
  imports: [CommonModule, RouterLink],
  templateUrl: './estado-pedido.html',
  styleUrl: './estado-pedido.scss'
})
export class EstadoPedido implements OnInit, OnDestroy {
  pasos = [
    { icono: '📋', titulo: 'Pedido Recibido', descripcion: 'Tu pedido fue registrado', completado: false },
    { icono: '👨‍🍳', titulo: 'En Preparación', descripcion: 'Estamos preparando tu pedido', completado: false },
    { icono: '✅', titulo: 'Listo', descripcion: 'Tu pedido está listo para recoger', completado: false },
    { icono: '🎉', titulo: 'Entregado', descripcion: '¡Disfruta tu pedido!', completado: false },
  ];

  pasoActual = 0;
  mensaje = '';
  intervalo: any;

  ngOnInit() {
    this.avanzar();
    this.intervalo = setInterval(() => {
      if (this.pasoActual < this.pasos.length) {
        this.avanzar();
      } else {
        clearInterval(this.intervalo);
      }
    }, 2500);
  }

  avanzar() {
    if (this.pasoActual < this.pasos.length) {
      this.pasos[this.pasoActual].completado = true;
      this.mensaje = this.pasos[this.pasoActual].descripcion;
      this.pasoActual++;
    }
  }

  ngOnDestroy() {
    clearInterval(this.intervalo);
  }
}