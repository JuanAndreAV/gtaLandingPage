import { Component, signal } from '@angular/core';
import {RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navigate-options',
  imports: [RouterLinkActive, RouterLink],
  standalone: true, 
  templateUrl: './navigate-options.component.html',
  styleUrl: './navigate-options.component.css',
})
export class NavigateOptionsComponent {
 
  rutas = signal<any[]>([
    { nombre: 'Dashboard', ruta: '/admin/reports' },
    { nombre: 'Gestión de Cursos', ruta: '/admin/cursos' },
    { nombre: 'Gestión de Usuarios', ruta: '/admin/usuarios' },
    { nombre: 'Inscripciones', ruta: '/admin/inscripciones' },  
  ]
  )



}
