import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { HomeComponent } from './pages/home/home.component';
import { FooterComponent } from './layout/footer/footer.component';
import { Q10ConsultaDocenteComponent } from './pages/q10-consulta-docente/q10-consulta-docente.component';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, HomeComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'girardotaescultura';
}
