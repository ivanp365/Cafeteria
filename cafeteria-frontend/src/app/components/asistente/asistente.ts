import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';

interface Mensaje {
  texto: string;
  esUsuario: boolean;
}

@Component({
  selector: 'app-asistente',
  imports: [CommonModule, FormsModule],
  templateUrl: './asistente.html',
  styleUrl: './asistente.scss'
})
export class Asistente {
  mensajes: Mensaje[] = [
    { texto: '¡Hola! 👋 Soy el asistente de la cafetería. Cuéntame qué se te antoja y te recomiendo algo del menú.', esUsuario: false }
  ];
  inputMensaje = '';
  cargando = false;
  productos: any[] = [];

  constructor(private api: ApiService) {
    this.api.getProductos().subscribe(p => this.productos = p);
  }

  enviar() {
    if (!this.inputMensaje.trim() || this.cargando) return;
    const texto = this.inputMensaje.trim();
    this.mensajes.push({ texto, esUsuario: true });
    this.inputMensaje = '';
    this.cargando = true;

    setTimeout(() => {
      const respuesta = this.generarRespuesta(texto);
      this.mensajes.push({ texto: respuesta, esUsuario: false });
      this.cargando = false;
    }, 800);
  }

  generarRespuesta(mensaje: string): string {
    const msg = mensaje.toLowerCase();
    const prods = this.productos;

    if (prods.length === 0) {
      return 'Cargando el menú... intenta de nuevo en un momento 😊';
    }

    // Buscar por palabras clave
    let recomendados: any[] = [];

    if (msg.includes('dulce') || msg.includes('postre') || msg.includes('torta') || msg.includes('cake')) {
      recomendados = prods.filter(p =>
        p.categoria_nombre?.toLowerCase().includes('torta') ||
        p.categoria_nombre?.toLowerCase().includes('postre') ||
        p.nombre?.toLowerCase().includes('torta') ||
        p.nombre?.toLowerCase().includes('dulce')
      );
    } else if (msg.includes('económico') || msg.includes('barato') || msg.includes('precio')) {
      recomendados = [...prods].sort((a, b) => parseFloat(a.precio) - parseFloat(b.precio)).slice(0, 2);
    } else if (msg.includes('caro') || msg.includes('especial') || msg.includes('premium')) {
      recomendados = [...prods].sort((a, b) => parseFloat(b.precio) - parseFloat(a.precio)).slice(0, 2);
    } else if (msg.includes('bebida') || msg.includes('tomar') || msg.includes('café') || msg.includes('jugo')) {
      recomendados = prods.filter(p =>
        p.categoria_nombre?.toLowerCase().includes('bebida') ||
        p.categoria_nombre?.toLowerCase().includes('café') ||
        p.nombre?.toLowerCase().includes('café')
      );
    } else if (msg.includes('todo') || msg.includes('menú') || msg.includes('opciones') || msg.includes('qué hay')) {
      recomendados = prods.slice(0, 3);
    } else {
      // Búsqueda general por nombre
      recomendados = prods.filter(p =>
        p.nombre?.toLowerCase().includes(msg) ||
        p.categoria_nombre?.toLowerCase().includes(msg)
      );
      if (recomendados.length === 0) {
        recomendados = prods.slice(0, 2);
      }
    }

    if (recomendados.length === 0) {
      const todos = prods.map(p => `• ${p.nombre} - $${parseFloat(p.precio).toLocaleString('es-CO')}`).join('\n');
      return `Hmm, no encontré algo específico para eso, pero tenemos:\n\n${todos}\n\n¿Alguno te llama la atención? 😊`;
    }

    const lista = recomendados.map(p =>
      `• ${p.nombre} (${p.categoria_nombre}) - $${parseFloat(p.precio).toLocaleString('es-CO')}`
    ).join('\n');

    const frases = [
      `¡Excelente elección! Te recomiendo:\n\n${lista}\n\n¿Lo agrego a tu pedido? 🛒`,
      `Para eso, lo mejor de nuestra carta es:\n\n${lista}\n\n¡Te va a encantar! 😋`,
      `Justo tenemos algo perfecto para ti:\n\n${lista}\n\n¿Qué te parece? ☕`,
    ];

    return frases[Math.floor(Math.random() * frases.length)];
  }

  onEnter(event: KeyboardEvent) {
    if (event.key === 'Enter') this.enviar();
  }
}