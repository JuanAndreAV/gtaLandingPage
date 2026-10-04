import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavigateOptionsComponent } from '../../shared/components/navigate-options/navigate-options.component';

@Component({
  selector: 'app-academico',
  imports: [RouterModule, NavigateOptionsComponent],
  templateUrl: './academico.component.html',
  styleUrl: './academico.component.css',
})
export class AcademicoComponent {
  rutas = signal  ([
    { nombre: 'Aulas', ruta: '/admin/academico/aulas' },
    { nombre: 'Periodos', ruta: '/admin/academico/periodos' },
    { nombre: 'Programas', ruta: '/admin/academico/programas' },
    { nombre: 'Asignaturas', ruta: '/admin/academico/asignaturas' },
    { nombre: 'Cursos', ruta: '/admin/academico/cursos' },
    //{ nombre: 'Inscripciones', ruta: '/admin/academico/inscripciones' },
    { nombre: 'Estado-cursos', ruta: '/admin/academico/cursos-disponibles' },
    { nombre: 'Inscripción-estudiante', ruta: '/admin/academico/registro-estudiante' },
  ])

}
