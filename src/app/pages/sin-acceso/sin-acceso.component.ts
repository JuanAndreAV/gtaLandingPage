import { Component, inject } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-sin-acceso',
  imports: [],
  template: `<div class="max-w-md mx-auto mt-20 text-center p-6">
      <h2 class="text-xl font-bold mb-2">Sin acceso al panel</h2>
      <p class="text-gray-500 mb-4">Tu usuario no tiene rol de administrador ni de docente.</p>
      <button (click)="auth.logout()" class="px-4 py-2 bg-gray-900 text-white rounded-lg">Cerrar sesión</button>
    </div>`,
})
export class SinAccesoComponent {
   auth = inject(AuthService);

}
