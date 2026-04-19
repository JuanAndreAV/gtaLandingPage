import { Component, inject, signal} from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';
import { RouterModule } from '@angular/router';
import { NavigateOptionsComponent } from '../../shared/components/navigate-options/navigate-options.component';

@Component({
  selector: 'app-areaprofesor',
  imports: [RouterModule, NavigateOptionsComponent],
  templateUrl: './areaprofesor.component.html',
  styleUrl: './areaprofesor.component.css',
})
export class AreaprofesorComponent {
 private authService = inject(AuthService);

  user = signal(this.authService.user());
  routes = signal([
    { nombre: 'Reporte novedades', ruta: '/profesor/novedades-profesor' },
    { nombre: 'Reportes de Asistencia', ruta: '/inasistencia' },
    
  ]);
}
