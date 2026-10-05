import { Component, inject } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-elegir-modo',
  imports: [],
  templateUrl: './elegir-modo.component.html',
  styleUrl: './elegir-modo.component.css',
})
export class ElegirModoComponent {
private auth = inject(AuthService);
  private router = inject(Router);

  entrar(modo: 'admin' | 'profesor') {
    this.auth.elegirModo(modo);
    this.router.navigateByUrl(modo === 'admin' ? '/admin' : '/profesor');
  }
}
