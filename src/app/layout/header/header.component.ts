import { NgClass } from '@angular/common';
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [NgClass],
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
    { id: 1, label: 'Inicio', link: '#inicio' },
    { id: 2, label: 'Talleres', link: '#talleres' },
    { id: 3, label: 'Eventos', link: '#eventos' },
    { id: 4, label: 'Galería', link: '#galeria' },
    { id: 5 ,label: 'Contacto', link: '#contacto' }
  ];
}
