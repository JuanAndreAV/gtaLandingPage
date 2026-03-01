import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Q10Service } from '../../services/q10.service';
import { Q10AsistenciaService } from '../../services/academico/q10-asistencia.service';
import { CursoQ10 } from '../../models/curso-q10';
import { AsistenciaQ10, Estudiante } from '../../models/asistencia-q10';

// ── Interfaces locales para vistas computadas ──────────────────────────────

export interface FilaEstudiante extends Estudiante {
  Nombre_curso:      string;
  Consecutivo_curso: number;
  Nombre_asignatura: string;
  Codigo_asignatura: string;
  Nombre_docente:    string;
  Nombre_sede:       string;
  enRiesgo:          boolean;
}

export interface ResumenCurso {
  consecutivoCurso:     number;
  nombreCurso:          string;
  nombreAsignatura:     string;
  codigoAsignatura:     string;
  nombreDocente:        string;
  nombreSede:           string;
  totalEstudiantes:     number;
  promedioInasistencia: number;
  promedioEvaluacion:   number;
  estudiantesEnRiesgo:  number;
}

@Component({
  selector: 'app-q10-asistencia',
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './q10-asistencia.component.html',
  styleUrl: './q10-asistencia.component.css',
})
export class Q10AsistenciaComponent implements OnInit {
  public q10CursosService  = inject(Q10Service);
  public asistenciaService = inject(Q10AsistenciaService);

  // ── Datos base ────────────────────────────────────────────────────────────
  public todosLosCursos = signal<CursoQ10[]>([]);

  // ── Selecciones ───────────────────────────────────────────────────────────
  public programaSeleccionado   = signal<string>('');
  public asignaturaSeleccionada = signal<string>('');
  public cursoSeleccionado      = signal<string>('');

  // ── Estados UI ────────────────────────────────────────────────────────────
  public cargandoCursos  = signal<boolean>(false);
  public reporteGenerado = signal<boolean>(false);

  // ── Programas únicos ──────────────────────────────────────────────────────
  public programas = computed(() => {
    const vistos = new Set<string>();
    return this.todosLosCursos().filter((c) => {
      if (vistos.has(c.Codigo_programa)) return false;
      vistos.add(c.Codigo_programa);
      return true;
    });
  });

  // ── Asignaturas únicas del programa seleccionado ─────────────────────────
  public asignaturas = computed(() => {
    const prog = this.programaSeleccionado();
    if (!prog) return [];
    const vistos = new Set<string>();
    return this.todosLosCursos()
      .filter((c) => c.Codigo_programa === prog)
      .filter((c) => {
        if (vistos.has(c.Codigo_asignatura)) return false;
        vistos.add(c.Codigo_asignatura);
        return true;
      });
  });

  // ── Cursos de la asignatura seleccionada ──────────────────────────────────
  public cursosFiltrados = computed(() => {
    const asig = this.asignaturaSeleccionada();
    if (!asig) return [];
    return this.todosLosCursos().filter(
      (c) =>
        c.Codigo_programa   === this.programaSeleccionado() &&
        c.Codigo_asignatura === asig
    );
  });

  // ── Labels para encabezado ────────────────────────────────────────────────
  public nombrePrograma = computed(
    () => this.programas().find((p) => p.Codigo_programa === this.programaSeleccionado())?.Nombre_programa ?? ''
  );
  public nombreAsignatura = computed(
    () => this.asignaturas().find((a) => a.Codigo_asignatura === this.asignaturaSeleccionada())?.Nombre_asignatura ?? ''
  );

  // ── Acceso a signals del servicio ─────────────────────────────────────────
  public get rawData():      AsistenciaQ10[] { return this.asistenciaService.asistencia(); }
  public get isLoading():    boolean         { return this.asistenciaService.isLoading(); }
  public get serviceError(): string | null   { return this.asistenciaService.error(); }

  // ── Aplanar estudiantes de todos los cursos ───────────────────────────────
  public estudiantesDetalle = computed((): FilaEstudiante[] =>
    this.asistenciaService.asistencia().flatMap((curso) =>
      curso.Estudiantes.map((est) => ({
        ...est,
        Nombre_curso:      curso.Nombre_curso,
        Consecutivo_curso: curso.Consecutivo_curso,
        Nombre_asignatura: curso.Nombre_asignatura,
        Codigo_asignatura: curso.Codigo_asignatura,
        Nombre_docente:    curso.Nombre_completo_docente,
        Nombre_sede:       curso.Nombre_sede_jornada,
        enRiesgo:          est.Porcentaje_inasistencia > 20,
      }))
    )
  );

  // ── KPIs generales ────────────────────────────────────────────────────────
  public resumenGeneral = computed(() => {
    const filas = this.estudiantesDetalle();
    if (!filas.length) return null;
    const totalEstudiantes     = new Set(filas.map((f) => f.Codigo_matricula)).size;
    const promedioInasistencia = filas.reduce((a, f) => a + f.Porcentaje_inasistencia, 0) / filas.length;
    const promedioEvaluacion   = filas.reduce((a, f) => a + f.Promedio_evaluacion, 0) / filas.length;
    const estudiantesEnRiesgo  = filas.filter((f) => f.enRiesgo).length;
    const totalCursos          = this.asistenciaService.asistencia().length;
    return {
      totalEstudiantes,
      totalCursos,
      promedioInasistencia: +promedioInasistencia.toFixed(1),
      promedioEvaluacion:   +promedioEvaluacion.toFixed(1),
      estudiantesEnRiesgo,
    };
  });

  // ── Resumen por curso ─────────────────────────────────────────────────────
  public resumenPorCurso = computed((): ResumenCurso[] =>
    this.asistenciaService.asistencia().map((curso) => {
      const ests = curso.Estudiantes;
      return {
        consecutivoCurso:     curso.Consecutivo_curso,
        nombreCurso:          curso.Nombre_curso,
        nombreAsignatura:     curso.Nombre_asignatura,
        codigoAsignatura:     curso.Codigo_asignatura,
        nombreDocente:        curso.Nombre_completo_docente,
        nombreSede:           curso.Nombre_sede_jornada,
        totalEstudiantes:     ests.length,
        promedioInasistencia: ests.length
          ? +(ests.reduce((a, e) => a + e.Porcentaje_inasistencia, 0) / ests.length).toFixed(1)
          : 0,
        promedioEvaluacion: ests.length
          ? +(ests.reduce((a, e) => a + e.Promedio_evaluacion, 0) / ests.length).toFixed(1)
          : 0,
        estudiantesEnRiesgo: ests.filter((e) => e.Porcentaje_inasistencia > 20).length,
      };
    })
  );

  public get mostrarResumenCursos(): boolean {
    return !this.cursoSeleccionado() && this.resumenPorCurso().length > 1;
  }

  // ── Helpers de color ─────────────────────────────────────────────────────
  public colorInasistencia(pct: number): string {
    if (pct > 30) return 'text-red-600 font-semibold';
    if (pct > 20) return 'text-amber-500 font-semibold';
    return 'text-emerald-600';
  }
  public barColor(pct: number): string {
    if (pct > 30) return 'bg-red-500';
    if (pct > 20) return 'bg-amber-400';
    return 'bg-emerald-500';
  }
  public badgeFormalizado(valor: string): string {
    return valor === 'S'
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-slate-100 text-slate-500';
  }

  // ── Ciclo de vida ─────────────────────────────────────────────────────────
  ngOnInit() {
    this.cargandoCursos.set(true);
    this.q10CursosService.obtenerCursos().subscribe({
      next: (cursos) => { this.todosLosCursos.set(cursos); this.cargandoCursos.set(false); },
      error: ()       => { this.cargandoCursos.set(false); },
    });
  }

  // ── Handlers ─────────────────────────────────────────────────────────────
  onProgramaChange(codigo: string) {
    this.programaSeleccionado.set(codigo);
    this.asignaturaSeleccionada.set('');
    this.cursoSeleccionado.set('');
    this.asistenciaService.asistencia.set([]);
    this.reporteGenerado.set(false);
  }
  onAsignaturaChange(codigo: string) {
    this.asignaturaSeleccionada.set(codigo);
    this.cursoSeleccionado.set('');
    this.asistenciaService.asistencia.set([]);
    this.reporteGenerado.set(false);
  }
  onCursoChange(consecutivo: string) {
    this.cursoSeleccionado.set(consecutivo);
  }

  generarReporte() {
    const programa   = this.programaSeleccionado();
    const asignatura = this.asignaturaSeleccionada();
    if (!programa || !asignatura) return;
    const curso = this.cursoSeleccionado() || undefined;
    this.reporteGenerado.set(false);
    this.asistenciaService.obtenerAsistencia(programa, asignatura, curso)
      .subscribe({ next: () => this.reporteGenerado.set(true) });
  }

  limpiarReporte() {
    this.programaSeleccionado.set('');
    this.asignaturaSeleccionada.set('');
    this.cursoSeleccionado.set('');
    this.asistenciaService.asistencia.set([]);
    this.asistenciaService.error.set(null);
    this.reporteGenerado.set(false);
  }
}