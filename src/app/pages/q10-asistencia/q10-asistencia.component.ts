import { Component, inject, signal, computed, OnInit} from '@angular/core';
import { Q10Service } from '../../services/q10.service';
import { CursoQ10 } from '../../models/curso-q10';
import { Q10AsistenciaService } from '../../services/academico/q10-asistencia.service';

@Component({
  selector: 'app-q10-asistencia',
  imports: [],
  templateUrl: './q10-asistencia.component.html',
  styleUrl: './q10-asistencia.component.css',
})
export class Q10AsistenciaComponent implements OnInit {
  public q10Cursos = inject(Q10Service);
  public asistenciaService = inject(Q10AsistenciaService);
  public programasCursos = signal<CursoQ10[]>([]);
Abutton: any;

  ngOnInit() {
    this.q10Cursos.obtenerCursos().subscribe(cursos => {
      this.programasCursos.set(cursos);
    });
  }

  generarReporte(programa: string, curso?: string) {
    this.asistenciaService.obtenerAsistencia(programa = "MUS", curso).subscribe();
  }

}
