import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  username = '';
  password = '';
  error = '';
  cargando = false;

  constructor(private api: ApiService, private router: Router) {}

  login() {
    if (!this.username || !this.password) {
      this.error = 'Ingresa usuario y contraseña';
      return;
    }
    this.cargando = true;
    this.error = '';

    this.api.loginAdmin(this.username, this.password).subscribe({
      next: (res: any) => {
        if (res.ok) {
          localStorage.setItem('isAdmin', 'true');
          this.router.navigate(['/admin']);
        } else {
          this.error = 'Credenciales incorrectas';
        }
        this.cargando = false;
      },
      error: () => {
        this.error = 'Usuario o contraseña incorrectos';
        this.cargando = false;
      }
    });
  }

  onEnter(event: KeyboardEvent) {
    if (event.key === 'Enter') this.login();
  }
}