
import { Component, signal, computed, inject } from '@angular/core';
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
 private _AllmenuItems = [
  { id: 1, label: 'Inicio', link: '/', routerLink: true },
  { id: 2, label: 'Talleres',  fragment: 'talleres' },
  { id: 3, label: 'Eventos',  fragment: 'eventos'  },
  { id: 4, label: 'Galería', fragment: 'galeria' },
  { id: 5, label: 'Contacto',  fragment: 'contacto' },
  // ...
];
menuItems = computed(()=>{
if(this.authService.authStatus()=== 'authenticated'){
  return this._AllmenuItems.filter(item=> item.label === 'Inicio')
}
return this._AllmenuItems;
})

navigateToAnchor(fragment: string | undefined) {
  if (!fragment) return;
  this.mobileMenuOpen.set(false); // Cierra el menú si es móvil
  const element = document.getElementById(fragment);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
}
