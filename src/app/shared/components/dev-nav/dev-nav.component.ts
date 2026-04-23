import { Component,signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

interface NavRoute {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-dev-nav',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './dev-nav.component.html',
  styleUrl: './dev-nav.component.css',
})
export class DevNavComponent {
  private router = inject(Router);

  isOpen = signal<Boolean>(false);
  currentPath = signal<string>("");

  routes: NavRoute[] = [
    { path: '/poblacion',   label: 'Población',    icon: '👥' },
    { path: '/reportes',    label: 'Reportes',     icon: '📊' },
    { path: '/estudiantes', label: 'Estudiantes',  icon: '🎓' },
    { path: '/asistencia',  label: 'Asistencia',   icon: '📋' },
    {path: '/novedades-profesores', label: 'Novedades-Profesores',     icon: '📰' },
    
  ];

  toggle() {
    this.isOpen.update(()=>!this.isOpen());
  }
updatePath(path: string){
  this.currentPath.update(()=>path)
};
 
}