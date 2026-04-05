import { Component, input } from '@angular/core';
import { RouterLinkActive, RouterLink } from '@angular/router';
interface Ruta {
  nombre: string;
  ruta: string;
}
@Component({
  selector: 'app-navigate-options',
  imports: [RouterLinkActive, RouterLink],
  templateUrl: './navigate-options.component.html',
  
})
export class NavigateOptionsComponent {
public rutas = input.required<Ruta[]>();
}
