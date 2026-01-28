import { Component, inject, signal} from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-areaprofesor',
  imports: [],
  templateUrl: './areaprofesor.component.html',
  styleUrl: './areaprofesor.component.css',
})
export class AreaprofesorComponent {
 private authService = inject(AuthService);

  user = signal(this.authService.user());
}
