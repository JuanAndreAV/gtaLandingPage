
import { Component, signal, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  standalone: true
})
export class HeaderComponent {
mobileMenuOpen= signal(false);
authService = inject(AuthService);

  toggleMobileMenu(){
    this.mobileMenuOpen.update(estado => !estado);
  }
  //  menuItems = [
  //   { id: 1, label: 'Inicio', link: '/', routerLink: true },
  //   { id: 2, label: 'Talleres', link: '#talleres', routerLink: false },
  //   { id: 3, label: 'Eventos', link: '#eventos', routerLink: false },
  //   { id: 4, label: 'Galería', link: '#galeria', routerLink: false },
  //   { id: 5, label: 'Contacto', link: '#contacto', routerLink: false },
  //   //{ id: 6, label: 'Login', link: '/auth/login', routerLink: true },
  // ];
  menuItems = [
  { id: 1, label: 'Inicio', link: '/', routerLink: true },
  { id: 2, label: 'Talleres', link: '/', fragment: 'talleres', routerLink: true },
  { id: 3, label: 'Eventos', link: '/', fragment: 'eventos', routerLink: true },
  { id: 4, label: 'Galería', link: '/', fragment: 'galeria', routerLink: true },
  { id: 5, label: 'Contacto', link: '/', fragment: 'contacto', routerLink: true },
  // ...
];
navigateToAnchor(fragment: string | undefined) {
  if (!fragment) return;
  this.mobileMenuOpen.set(false); // Cierra el menú si es móvil
  const element = document.getElementById(fragment);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
}
