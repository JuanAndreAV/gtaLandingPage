import { Component, inject, signal, computed, OnInit} from '@angular/core';
import { Q10Service } from '../../services/q10.service';
import { CursoQ10 } from '../../models/curso-q10';
import { AsistenciaQ10 } from '../../models/asistencia-q10';
import { Q10AsistenciaService } from '../../services/academico/q10-asistencia.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
export interface ResumenCurso {
  codigoCurso: string;
  nombreCurso: string;
  totalEstudiantes: number;
  promedioInasistencia: number;
  promedioEvaluacion: number;
  estudiantesEnRiesgo: number; // inasistencia > 20%
}
@Component({
  selector: 'app-q10-asistencia',
  imports: [CommonModule, FormsModule],
  templateUrl: './q10-asistencia.component.html',
  styleUrl: './q10-asistencia.component.css',
})
export class Q10AsistenciaComponent implements OnInit {
  public q10CursosService = inject(Q10Service);
  public asistenciaService = inject(Q10AsistenciaService);

  // --- Datos crudos ---
  public todosLosCursos = signal<CursoQ10[]>([]);
  public asistenciaData = signal<AsistenciaQ10[]>([]);

  // --- Selecciones ---
  public programaSeleccionado = signal<string>('');
  public cursoSeleccionado = signal<string>('');

  // --- Estados UI ---
  public cargandoCursos = signal<boolean>(false);
  public cargandoReporte = signal<boolean>(false);
  public reporteGenerado = signal<boolean>(false);
  public error = signal<string | null>(null);

  // --- Programas únicos derivados de los cursos ---
  public programas = computed(() => {
    const vistos = new Set<string>();
    return this.todosLosCursos().filter((c) => {
      if (vistos.has(c.Codigo_programa)) return false;
      vistos.add(c.Codigo_programa);
      return true;
    });
  });

  // --- Cursos filtrados por programa seleccionado ---
  public cursosFiltrados = computed(() => {
    const prog = this.programaSeleccionado();
    if (!prog) return [];
    return this.todosLosCursos().filter((c) => c.Codigo_programa === prog);
  });

  // --- Nombre del programa seleccionado ---
  public nombrePrograma = computed(() => {
    const prog = this.programas().find(
      (p) => p.Codigo_programa === this.programaSeleccionado()
    );
    return prog?.Nombre_programa ?? '';
  });

  // --- Nombre del curso seleccionado ---
  public nombreCurso = computed(() => {
    const curso = this.cursosFiltrados().find(
      (c) => c.Codigo === this.cursoSeleccionado()
    );
    return curso?.Nombre ?? '';
  });

  // --- Resumen general del programa ---
  public resumenPrograma = computed(() => {
    const data = this.asistenciaData();
    if (!data.length) return null;

    const totalEstudiantes = new Set(data.map((d) => d.Codigo_estudiante)).size;
    const promedioInasistencia =
      data.reduce((acc, d) => acc + d.Porcentaje_inasistencia, 0) / data.length;
    const promedioEvaluacion =
      data.reduce((acc, d) => acc + d.Promedio_evaluacion, 0) / data.length;
    const estudiantesEnRiesgo = data.filter(
      (d) => d.Porcentaje_inasistencia > 20
    ).length;

    return {
      totalEstudiantes,
      promedioInasistencia: +promedioInasistencia.toFixed(1),
      promedioEvaluacion: +promedioEvaluacion.toFixed(1),
      estudiantesEnRiesgo,
    };
  });

  // --- Resumen por curso ---
  public resumenPorCurso = computed((): ResumenCurso[] => {
    const data = this.asistenciaData();
    if (!data.length) return [];

    const mapa = new Map<string, AsistenciaQ10[]>();
    for (const item of data) {
      const key = item.Codigo_curso;
      if (!mapa.has(key)) mapa.set(key, []);
      mapa.get(key)!.push(item);
    }

    return Array.from(mapa.entries()).map(([codigo, items]) => ({
      codigoCurso: codigo,
      nombreCurso: items[0].Nombre_curso,
      totalEstudiantes: new Set(items.map((i) => i.Codigo_estudiante)).size,
      promedioInasistencia: +(
        items.reduce((a, i) => a + i.Porcentaje_inasistencia, 0) / items.length
      ).toFixed(1),
      promedioEvaluacion: +(
        items.reduce((a, i) => a + i.Promedio_evaluacion, 0) / items.length
      ).toFixed(1),
      estudiantesEnRiesgo: items.filter((i) => i.Porcentaje_inasistencia > 20)
        .length,
    }));
  });

  // --- Detalle de estudiantes (tabla) ---
  public estudiantesDetalle = computed(() => {
    return this.asistenciaData().map((d) => ({
      ...d,
      enRiesgo: d.Porcentaje_inasistencia > 20,
    }));
  });

  // --- Helpers de color ---
  public colorInasistencia(pct: number): string {
    if (pct > 30) return 'text-red-600 font-semibold';
    if (pct > 20) return 'text-amber-500 font-semibold';
    return 'text-emerald-600';
  }

  public badgeEstado(estado: string): string {
    const e = estado.toLowerCase();
    if (e.includes('activ')) return 'bg-emerald-100 text-emerald-700';
    if (e.includes('retir') || e.includes('cancel'))
      return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-600';
  }

  public barColor(pct: number): string {
    if (pct > 30) return 'bg-red-500';
    if (pct > 20) return 'bg-amber-400';
    return 'bg-emerald-500';
  }

  ngOnInit() {
    this.cargandoCursos.set(true);
    this.q10CursosService.obtenerCursos().subscribe({
      next: (cursos) => {
        this.todosLosCursos.set(cursos);
        this.cargandoCursos.set(false);
      },
      error: () => {
        this.error.set('Error al cargar los cursos. Intente nuevamente.');
        this.cargandoCursos.set(false);
      },
    });
  }

  onProgramaChange(codigo: string) {
    this.programaSeleccionado.set(codigo);
    this.cursoSeleccionado.set('');
    this.asistenciaData.set([]);
    this.reporteGenerado.set(false);
  }

  onCursoChange(codigo: string) {
    this.cursoSeleccionado.set(codigo);
  }

  generarReporte() {
    const programa = this.programaSeleccionado();
    if (!programa) return;

    const curso = this.cursoSeleccionado() || undefined;
    this.cargandoReporte.set(true);
    this.error.set(null);
    this.reporteGenerado.set(false);

    this.asistenciaService.obtenerAsistencia(programa, curso).subscribe({
      next: (data: AsistenciaQ10[]) => {
        this.asistenciaData.set(data);
        this.reporteGenerado.set(true);
        this.cargandoReporte.set(false);
      },
      error: () => {
        this.error.set('Error al obtener el reporte de asistencia.');
        this.cargandoReporte.set(false);
      },
    });
  }

  limpiarReporte() {
    this.programaSeleccionado.set('');
    this.cursoSeleccionado.set('');
    this.asistenciaData.set([]);
    this.reporteGenerado.set(false);
    this.error.set(null);
  }

}
