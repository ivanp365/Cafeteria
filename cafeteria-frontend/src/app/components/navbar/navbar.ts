import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar implements OnInit {
  cantidadCarrito = 0;
  menuAbierto = false;

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.api.carrito$.subscribe(() => {
      this.cantidadCarrito = this.api.getCantidadCarrito();
    });
  }

  get isAdmin(): boolean {
    return typeof window !== 'undefined' && localStorage.getItem('isAdmin') === 'true';
  }

  logout() {
    localStorage.removeItem('isAdmin');
    this.router.navigate(['/']);
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }
}