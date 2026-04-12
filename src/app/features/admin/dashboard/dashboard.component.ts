import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavigateOptionsComponent } from '../../shared/components/navigate-options/navigate-options.component';



@Component({
  selector: 'app-dashboard',
  imports: [NavigateOptionsComponent, RouterModule], 
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  standalone: true
})
export class DashboardComponent   {
 
rutas = signal<any[]>([
  { nombre: 'Analisis-AI', ruta: '/admin/analisis-ai' },
  { nombre: 'Novedades-profesores', ruta: '/admin/novedades' },
  { nombre: 'Dashboard', ruta: '/admin/reports' },
  { nombre: 'Inasistencias', ruta: '/inasistencia' },

    { nombre: 'Gestión de Cursos', ruta: '/admin/cursos' },
    { nombre: 'Gestión de Usuarios', ruta: '/admin/usuarios' },
    //{ nombre: 'Inscripciones', ruta: '/admin/inscripciones' },  
      
  ]
  )

}
