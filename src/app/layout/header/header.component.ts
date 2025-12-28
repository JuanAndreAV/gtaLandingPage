
import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  standalone: true
})
export class HeaderComponent {
mobileMenuOpen= signal(false);

  toggleMobileMenu(){
    this.mobileMenuOpen.update(estado => !estado);
  }
   menuItems = [
    { id: 1, label: 'Inicio', link: '/', routerLink: true },
    { id: 2, label: 'Talleres', link: '#talleres', routerLink: false },
    { id: 3, label: 'Eventos', link: '#eventos', routerLink: false },
    { id: 4, label: 'Galería', link: '#galeria', routerLink: false },
    { id: 5, label: 'Contacto', link: '#contacto', routerLink: false },
    { id: 6, label: 'Login', link: '/auth/login', routerLink: true },
  ];
}
