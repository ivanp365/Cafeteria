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
    { texto: this.saludoInicial(), esUsuario: false }
  ];
  inputMensaje = '';
  cargando = false;
  productos: any[] = [];
  pedidos: any[] = [];

  constructor(private api: ApiService) {
    this.api.getProductos().subscribe(p => this.productos = p);
    this.api.getPedidos().subscribe(p => this.pedidos = p);
  }

  saludoInicial(): string {
    const hora = new Date().getHours();
    if (hora >= 6 && hora < 12) {
      return '¡Buenos días! ☀️ Soy el asistente de Coffee Time. A esta hora tenemos excelentes opciones para desayunar. ¿Qué se te antoja?';
    } else if (hora >= 12 && hora < 15) {
      return '¡Buenas tardes! 🌤️ Es hora del almuerzo en Coffee Time. ¿Te recomiendo algo para el mediodía?';
    } else if (hora >= 15 && hora < 19) {
      return '¡Buenas tardes! ☕ Hora perfecta para un café y algo dulce. ¿Qué se te antoja?';
    } else {
      return '¡Buenas noches! 🌙 Tenemos opciones perfectas para esta hora. ¿Qué deseas?';
    }
  }

  getHora(): number {
    return new Date().getHours();
  }

  getProductosPopulares(): any[] {
    const conteo: { [key: number]: number } = {};
    this.pedidos.forEach(p => {
      p.productos?.forEach((item: any) => {
        conteo[item.producto] = (conteo[item.producto] || 0) + (item.cantidad || 1);
      });
    });
    const sorted = Object.entries(conteo).sort((a, b) => b[1] - a[1]);
    const topIds = sorted.slice(0, 3).map(e => parseInt(e[0]));
    return this.productos.filter(p => topIds.includes(p.id));
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
    const hora = this.getHora();
    const populares = this.getProductosPopulares();
    const prods = this.productos;

    if (prods.length === 0) {
      return 'Cargando el menú... intenta de nuevo en un momento 😊';
    }

    // Recomendación por hora
    if (msg.includes('recomienda') || msg.includes('qué me das') || msg.includes('sorpréndeme') || msg.includes('no sé')) {
      return this.recomendarPorHora(hora, populares, prods);
    }

    // Productos populares
    if (msg.includes('popular') || msg.includes('más vendido') || msg.includes('favorito')) {
      if (populares.length > 0) {
        const lista = populares.map(p => `• ${p.nombre} - $${parseFloat(p.precio).toLocaleString('es-CO')}`).join('\n');
        return `🏆 Los más pedidos en Coffee Time son:\n\n${lista}\n\n¡No te los puedes perder!`;
      }
      return this.recomendarPorHora(hora, populares, prods);
    }

    // Por hora del día
    if (msg.includes('desayuno') || msg.includes('mañana') || msg.includes('morning')) {
      const desayunos = prods.filter(p => p.categoria_nombre?.toLowerCase().includes('desayuno'));
      if (desayunos.length > 0) {
        const lista = desayunos.map(p => `• ${p.nombre} - $${parseFloat(p.precio).toLocaleString('es-CO')}`).join('\n');
        return `🌅 Para desayunar te recomiendo:\n\n${lista}\n\n¡El mejor comienzo del día!`;
      }
    }

    if (msg.includes('almuerzo') || msg.includes('comida') || msg.includes('mediodía')) {
      const almuerzos = prods.filter(p => p.categoria_nombre?.toLowerCase().includes('almuerzo'));
      if (almuerzos.length > 0) {
        const lista = almuerzos.map(p => `• ${p.nombre} - $${parseFloat(p.precio).toLocaleString('es-CO')}`).join('\n');
        return `🍽️ Para el almuerzo tenemos:\n\n${lista}\n\n¡Delicioso y nutritivo!`;
      }
    }

    if (msg.includes('dulce') || msg.includes('postre') || msg.includes('torta') || msg.includes('cake')) {
      const dulces = prods.filter(p =>
        p.categoria_nombre?.toLowerCase().includes('torta') ||
        p.categoria_nombre?.toLowerCase().includes('postre')
      );
      if (dulces.length > 0) {
        const lista = dulces.map(p => `• ${p.nombre} - $${parseFloat(p.precio).toLocaleString('es-CO')}`).join('\n');
        return `🍰 Para los amantes de lo dulce:\n\n${lista}\n\n¡Irresistibles! 😋`;
      }
    }

    if (msg.includes('bebida') || msg.includes('tomar') || msg.includes('café') || msg.includes('jugo')) {
      const bebidas = prods.filter(p => p.categoria_nombre?.toLowerCase().includes('bebida'));
      if (bebidas.length > 0) {
        const lista = bebidas.map(p => `• ${p.nombre} - $${parseFloat(p.precio).toLocaleString('es-CO')}`).join('\n');
        return `☕ Nuestras bebidas:\n\n${lista}\n\n¿Cuál te llama la atención?`;
      }
    }

    if (msg.includes('económico') || msg.includes('barato') || msg.includes('precio')) {
      const baratos = [...prods].sort((a, b) => parseFloat(a.precio) - parseFloat(b.precio)).slice(0, 3);
      const lista = baratos.map(p => `• ${p.nombre} - $${parseFloat(p.precio).toLocaleString('es-CO')}`).join('\n');
      return `💰 Las opciones más económicas:\n\n${lista}\n\n¡Calidad al mejor precio!`;
    }

    // Búsqueda general
    let recomendados = prods.filter(p =>
      p.nombre?.toLowerCase().includes(msg) ||
      p.categoria_nombre?.toLowerCase().includes(msg)
    );

    if (recomendados.length === 0) {
      return this.recomendarPorHora(hora, populares, prods);
    }

    const lista = recomendados.slice(0, 3).map(p =>
      `• ${p.nombre} (${p.categoria_nombre}) - $${parseFloat(p.precio).toLocaleString('es-CO')}`
    ).join('\n');

    return `Encontré esto para ti:\n\n${lista}\n\n¿Te interesa alguno? 😊`;
  }

  recomendarPorHora(hora: number, populares: any[], prods: any[]): string {
    let categoria = '';
    let emoji = '';
    let mensaje = '';

    if (hora >= 6 && hora < 12) {
      categoria = 'desayuno';
      emoji = '🌅';
      mensaje = 'Para esta hora de la mañana te recomiendo';
    } else if (hora >= 12 && hora < 15) {
      categoria = 'almuerzo';
      emoji = '🍽️';
      mensaje = 'Para el almuerzo lo ideal es';
    } else if (hora >= 15 && hora < 19) {
      categoria = 'torta';
      emoji = '☕';
      mensaje = 'Para la tarde, un café con algo dulce es perfecto';
    } else {
      categoria = 'snack';
      emoji = '🌙';
      mensaje = 'Para esta hora te recomiendo algo ligero';
    }

    let recomendados = prods.filter(p =>
      p.categoria_nombre?.toLowerCase().includes(categoria)
    );

    if (recomendados.length === 0 && populares.length > 0) {
      recomendados = populares;
      mensaje = '🏆 Según nuestros clientes frecuentes, lo más popular es';
    }

    if (recomendados.length === 0) {
      recomendados = prods.slice(0, 3);
    }

    const lista = recomendados.slice(0, 3).map(p =>
      `• ${p.nombre} - $${parseFloat(p.precio).toLocaleString('es-CO')}`
    ).join('\n');

    return `${emoji} ${mensaje}:\n\n${lista}\n\n¿Te animas con alguno? 😊`;
  }

  onEnter(event: KeyboardEvent) {
    if (event.key === 'Enter') this.enviar();
  }
}