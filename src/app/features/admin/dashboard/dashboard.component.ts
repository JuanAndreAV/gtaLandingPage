import { Component, computed, effect, HostListener, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { NgTemplateOutlet } from '@angular/common';

interface ItemMenu {
  etiqueta: string;
  ruta: string;
  icono: string;
}

interface SeccionMenu {
  id: string;
  titulo: string;
  items: ItemMenu[];
}

const CLAVE_SECCIONES = 'admin-menu:secciones-cerradas';

// Para agregar una pantalla al panel basta con sumarla a la sección que corresponda.
const SECCIONES: SeccionMenu[] = [
  {
    id: 'configuracion',
    titulo: 'Configuración académica',
    items: [
      { etiqueta: 'Periodos', ruta: '/admin/academico/periodos', icono: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
      { etiqueta: 'Programas', ruta: '/admin/academico/programas', icono: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
      { etiqueta: 'Asignaturas', ruta: '/admin/academico/asignaturas', icono: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
      { etiqueta: 'Niveles', ruta: '/admin/academico/niveles', icono: 'M3 17l6-6 4 4 8-8M14 7h7v7' },
      { etiqueta: 'Aulas', ruta: '/admin/academico/aulas', icono: 'M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6' },
    ],
  },
  {
    id: 'oferta',
    titulo: 'Oferta y matrícula',
    items: [
      { etiqueta: 'Cursos', ruta: '/admin/academico/cursos', icono: 'M4 6h16M4 10h16M4 14h10M4 18h7' },
      { etiqueta: 'Oferta docente', ruta: '/admin/academico/ofertas', icono: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
      { etiqueta: 'Estado de cursos', ruta: '/admin/academico/cursos-disponibles', icono: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
      { etiqueta: 'Inscribir estudiante', ruta: '/admin/academico/registro-estudiante', icono: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' },
    ],
  },
  {
    id: 'seguimiento',
    titulo: 'Seguimiento',
    items: [
      { etiqueta: 'Seguimiento de asistencia', ruta: '/admin/academico/seguimiento-asistencia', icono: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
      { etiqueta: 'Inasistencias', ruta: '/inasistencia', icono: 'M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z' },
      { etiqueta: 'Novedades de profesores', ruta: '/admin/novedades', icono: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' },
      { etiqueta: 'Indicadores', ruta: '/admin/reports', icono: 'M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
      { etiqueta: 'Reporte de encuestas', ruta: '/admin/reporte-encuestas', icono: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055zM20.488 9H15V3.512A9.025 9.025 0 0120.488 9z' },
      { etiqueta: 'Análisis con IA', ruta: '/admin/analisis-ai', icono: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
    ],
  },
  {
    id: 'administracion',
    titulo: 'Administración',
    items: [
      { etiqueta: 'Usuarios', ruta: '/admin/usuarios', icono: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    ],
  },
];

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgTemplateOutlet],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  standalone: true,
})
export class DashboardComponent {
  private router = inject(Router);

  readonly secciones = SECCIONES;
  menuMovilAbierto = signal(false);
  private cerradas = signal<Set<string>>(this.leerCerradas());

  private readonly url = toSignal(
    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd), map((e) => e.urlAfterRedirects)),
    { initialValue: this.router.url },
  );

  /** Pantalla actual (para la barra superior en celular) */
  readonly actual = computed(() => {
    const url = this.url().split('?')[0];
    for (const s of SECCIONES) {
      const item = s.items.find((i) => url === i.ruta || url.startsWith(i.ruta + '/'));
      if (item) return { seccion: s, item };
    }
    return null;
  });

  constructor() {
    // Al navegar: cierra el cajón en celular y despliega la sección de la página actual
    // (solo depende de la URL: plegar a mano la sección actual no la vuelve a abrir)
    effect(() => {
      const actual = this.actual();
      untracked(() => {
        this.menuMovilAbierto.set(false);
        if (actual && this.cerradas().has(actual.seccion.id)) {
          this.cerradas.update((s) => { const n = new Set(s); n.delete(actual.seccion.id); return n; });
        }
      });
    });
    effect(() => this.guardarCerradas(this.cerradas()));
  }

  estaAbierta(id: string): boolean {
    return !this.cerradas().has(id);
  }

  alternar(id: string) {
    this.cerradas.update((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  @HostListener('document:keydown.escape')
  cerrarMenuMovil() {
    this.menuMovilAbierto.set(false);
  }

  private leerCerradas(): Set<string> {
    try {
      const g = localStorage.getItem(CLAVE_SECCIONES);
      if (g) return new Set(JSON.parse(g));
    } catch { /* almacenamiento no disponible */ }
    return new Set();
  }

  private guardarCerradas(s: Set<string>) {
    try { localStorage.setItem(CLAVE_SECCIONES, JSON.stringify([...s])); } catch { /* sin almacenamiento */ }
  }
}
