import { Component, signal, computed, inject, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService, Modo } from '../../auth/services/auth.service';

interface MenuItem {
  id: number;
  label: string;
  link?: string;
  fragment?: string;
}

@Component({
  selector: 'app-header',
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  standalone: true,
})
export class HeaderComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  mobileMenuOpen = signal(false);
  perfilMenuOpen = signal(false);

  readonly etiquetaModo: Record<Modo, string> = {
    admin: 'Administrador',
    profesor: 'Docente',
  };

  private readonly _allMenuItems: MenuItem[] = [
    { id: 1, label: 'Inicio', link: '/' },
    { id: 2, label: 'Talleres', fragment: 'talleres' },
    { id: 3, label: 'Eventos', fragment: 'eventos' },
    { id: 4, label: 'Oferta de cursos', link: '/oferta-publica' },
    { id: 5, label: 'Contacto', fragment: 'contacto' },
  ];

  autenticado = computed(() => this.authService.authStatus() === 'authenticated');

  menuItems = computed(() =>
    this.autenticado()
      ? this._allMenuItems.filter(i => i.label === 'Inicio')
      : this._allMenuItems,
  );

  /** Perfiles a los que puede cambiar (más de uno = mostrar selector). */
  tieneVariosPerfiles = computed(() => this.authService.rolesDisponibles().length > 1);

  iniciales = computed(() => {
    const nombre = this.authService.user()?.nombre_completo?.trim() ?? '';
    const partes = nombre.split(/\s+/).filter(Boolean);
    return ((partes[0]?.[0] ?? '') + (partes[1]?.[0] ?? '')).toUpperCase() || '?';
  });

  rutaPanel = computed(() => (this.authService.modo() === 'admin' ? '/admin' : '/profesor'));

  toggleMobileMenu() {
    this.mobileMenuOpen.update(v => !v);
  }

  togglePerfilMenu() {
    this.perfilMenuOpen.update(v => !v);
  }

  cambiarPerfil(m: Modo) {
    this.perfilMenuOpen.set(false);
    this.mobileMenuOpen.set(false);
    if (this.authService.modo() !== m) this.authService.elegirModo(m);
    this.router.navigateByUrl(m === 'admin' ? '/admin' : '/profesor');
  }

  cerrarSesion() {
    this.perfilMenuOpen.set(false);
    this.mobileMenuOpen.set(false);
    this.authService.logout();
  }

  navigateToAnchor(fragment: string | undefined) {
    if (!fragment) return;
    this.mobileMenuOpen.set(false);
    const scroll = () =>
      document.getElementById(fragment)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Si no estamos en el home, primero navegar y luego hacer scroll
    if (this.router.url.split('#')[0] !== '/') {
      this.router.navigateByUrl('/').then(() => setTimeout(scroll, 50));
    } else {
      scroll();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent) {
    const dentro = (e.target as HTMLElement | null)?.closest?.('[data-perfil-menu]');
    if (this.perfilMenuOpen() && !dentro) {
      this.perfilMenuOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.perfilMenuOpen.set(false);
    this.mobileMenuOpen.set(false);
  }
}
