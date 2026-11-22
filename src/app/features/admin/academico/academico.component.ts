import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// La navegación del área académica vive en el menú lateral del panel (DashboardComponent)
@Component({
  selector: 'app-academico',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class AcademicoComponent {}
