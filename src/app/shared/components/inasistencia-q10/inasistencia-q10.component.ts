import {
  Component,
  inject,
  signal,
  computed,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Q10AsistenciaService } from '../../../services/academico/q10-asistencia.service';
import { InasistenciaQ10, Curso, Inasistencia } from '../../../models/inasistencia-q10';

// ── Interfaces para vistas computadas ────────────────────────────────────

interface FilaEstudiante {
  nombreCompleto:     string;
  identificacion:     string;
  sexo:               string;
  correo:             string;
  celular:            string;
  totalCursos:        number;
  totalInasistencias: number;
  justificadas:       number;
  sinJustificar:      number;
  cursos:             Curso[];
  expandido:          boolean;
}

interface ResumenCurso {
  codigoCurso:        string;
  nombreCurso:        string;
  nombreModulo:       string;
  nombreDocente:      string;
  periodo:            string;
  totalInasistencias: number;
  justificadas:       number;
  sinJustificar:      number;
  estudiantes:        number;
}

interface InasistenciaDia {
  fecha:        string;
  dia:          string;
  hora:         string;
  justificada:  boolean;
  detalle:      string | null;
  nombreCurso:  string;
  nombreDocente:string;
}

@Component({
  selector: 'app-inasistencia-q10',
  imports: [CommonModule, ReactiveFormsModule, DecimalPipe],
  templateUrl: './inasistencia-q10.component.html',
  styleUrl: './inasistencia-q10.component.css',
})
export class InasistenciaQ10Component {
  inasistenciaService = inject(Q10AsistenciaService);

  // ── Estados UI ────────────────────────────────────────────────────────
  mensajeError  = signal<string | null>(null);
  reporteVisible = signal<boolean>(false);
  vistaActiva   = signal<'estudiantes' | 'cursos' | 'cronologia'>('estudiantes');

  // Filas expandidas en la tabla de estudiantes
  private expandidos = signal<Set<string>>(new Set());

  // ── Formulario ────────────────────────────────────────────────────────
  // Fecha de inicio por defecto: primer día del mes actual
  private hoy     = new Date();
  private primerDiaMes = new Date(this.hoy.getFullYear(), this.hoy.getMonth(), 1)
    .toISOString().split('T')[0];
  private hoyStr  = this.hoy.toISOString().split('T')[0];

  asistenciaForm = new FormGroup({
    fechaInicio: new FormControl(this.primerDiaMes, [Validators.required]),
    fechaFin:    new FormControl(this.hoyStr,       [Validators.required]),
  });

  // ── Accesos rápidos al servicio ───────────────────────────────────────
  get isLoading(): boolean              { return this.inasistenciaService.isLoading(); }
  get serviceError(): string | null     { return this.inasistenciaService.error(); }
  get rawData(): InasistenciaQ10[]      { return this.inasistenciaService.inasistencia(); }

  // ── KPIs globales ─────────────────────────────────────────────────────
  kpis = computed(() => {
    const data = this.inasistenciaService.inasistencia();
    if (!data.length) return null;

    const todasInasistencias = data.flatMap((e) =>
      e.Cursos.flatMap((c) => c.Inasistencias)
    );

    const totalRegistros    = todasInasistencias.length;
    const justificadas      = todasInasistencias.filter((i) => i.Justificacion).length;
    const sinJustificar     = totalRegistros - justificadas;
    const tasaJustificacion = totalRegistros
      ? +((justificadas / totalRegistros) * 100).toFixed(1)
      : 0;

    // Estudiante con más inasistencias
    const topEstudiante = [...data].sort((a, b) => {
      const fa = a.Cursos.reduce((s, c) => s + c.Cantidad_inasistencia, 0);
      const fb = b.Cursos.reduce((s, c) => s + c.Cantidad_inasistencia, 0);
      return fb - fa;
    })[0];

    return {
      totalEstudiantes:  data.length,
      totalInasistencias: totalRegistros,
      justificadas,
      sinJustificar,
      tasaJustificacion,
      topEstudianteNombre: topEstudiante
        ? `${topEstudiante.Primer_nombre} ${topEstudiante.Primer_apellido}`
        : '—',
      topEstudianteCantidad: topEstudiante
        ? topEstudiante.Cursos.reduce((s, c) => s + c.Cantidad_inasistencia, 0)
        : 0,
    };
  });

  // ── Tabla de estudiantes ──────────────────────────────────────────────
  filasEstudiantes = computed((): FilaEstudiante[] => {
    return this.inasistenciaService.inasistencia().map((est) => {
      const id = est.Numero_identificacion_estudiante;
      const totalInasistencias = est.Cursos.reduce(
        (s, c) => s + c.Cantidad_inasistencia, 0
      );
      const justificadas = est.Cursos.flatMap((c) => c.Inasistencias)
        .filter((i) => i.Justificacion).length;

      return {
        nombreCompleto:     `${est.Primer_nombre} ${est.Segundo_nombre ?? ''} ${est.Primer_apellido} ${est.Segundo_apellido ?? ''}`.replace(/\s+/g, ' ').trim(),
        identificacion:     id,
        sexo:               est.Sexo,
        correo:             est.Correo_electronico_personal,
        celular:            est.Celular,
        totalCursos:        est.Cursos.length,
        totalInasistencias,
        justificadas,
        sinJustificar:      totalInasistencias - justificadas,
        cursos:             est.Cursos,
        expandido:          this.expandidos().has(id),
      };
    }).sort((a, b) => b.totalInasistencias - a.totalInasistencias);
  });

  // ── Resumen por curso ─────────────────────────────────────────────────
  resumenCursos = computed((): ResumenCurso[] => {
    const mapa = new Map<string, { curso: Curso; estudiantes: Set<string> }>();

    for (const est of this.inasistenciaService.inasistencia()) {
      for (const curso of est.Cursos) {
        const key = curso.Codigo_curso;
        if (!mapa.has(key)) {
          mapa.set(key, { curso, estudiantes: new Set() });
        }
        mapa.get(key)!.estudiantes.add(est.Numero_identificacion_estudiante);
      }
    }

    return Array.from(mapa.values()).map(({ curso, estudiantes }) => {
      const todas       = curso.Inasistencias;
      const justificadas = todas.filter((i) => i.Justificacion).length;
      return {
        codigoCurso:        curso.Codigo_curso,
        nombreCurso:        curso.Nombre_curso,
        nombreModulo:       curso.Nombre_modulo,
        nombreDocente:      curso.Nombre_docente,
        periodo:            curso.Periodo_curso,
        totalInasistencias: curso.Cantidad_inasistencia,
        justificadas,
        sinJustificar:      curso.Cantidad_inasistencia - justificadas,
        estudiantes:        estudiantes.size,
      };
    }).sort((a, b) => b.totalInasistencias - a.totalInasistencias);
  });

  // ── Cronología de inasistencias por fecha ─────────────────────────────
  cronologia = computed((): Map<string, InasistenciaDia[]> => {
    const mapa = new Map<string, InasistenciaDia[]>();

    for (const est of this.inasistenciaService.inasistencia()) {
      for (const curso of est.Cursos) {
        for (const inas of curso.Inasistencias) {
          const fecha = inas.Fecha;
          if (!mapa.has(fecha)) mapa.set(fecha, []);
          mapa.get(fecha)!.push({
            fecha,
            dia:           inas.Dia,
            hora:          inas.Hora,
            justificada:   inas.Justificacion,
            detalle:       inas.Detalle_justificacion ?? null,
            nombreCurso:   curso.Nombre_curso,
            nombreDocente: curso.Nombre_docente,
          });
        }
      }
    }

    // Ordenar fechas descendente
    return new Map(
      [...mapa.entries()].sort((a, b) => b[0].localeCompare(a[0]))
    );
  });

  cronologiaEntradas = computed(() => [...this.cronologia().entries()]);

  // ── Helpers ───────────────────────────────────────────────────────────
  toggleExpandido(identificacion: string) {
    const set = new Set(this.expandidos());
    if (set.has(identificacion)) set.delete(identificacion);
    else set.add(identificacion);
    this.expandidos.set(set);
  }

  colorInasistencia(n: number): string {
    if (n >= 5) return 'text-red-600 font-bold';
    if (n >= 3) return 'text-amber-500 font-semibold';
    return 'text-slate-700';
  }

  badgeJustificacion(justificada: boolean): string {
    return justificada
      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
      : 'bg-red-100 text-red-700 border border-red-200';
  }

  sexoBadge(sexo: string): string {
    return sexo === 'F'
      ? 'bg-pink-100 text-pink-700'
      : 'bg-sky-100 text-sky-700';
  }

  // ── Acción principal ──────────────────────────────────────────────────
  obtenerInasistencia() {
    this.mensajeError.set(null);
    if (this.asistenciaForm.invalid) {
      this.mensajeError.set('Por favor, complete ambos campos de fecha.');
      this.asistenciaForm.markAllAsTouched();
      return;
    }
    const { fechaInicio, fechaFin } = this.asistenciaForm.value;
    if (fechaInicio! > fechaFin!) {
      this.mensajeError.set('La fecha de inicio no puede ser mayor a la fecha fin.');
      return;
    }

    this.reporteVisible.set(false);
    this.expandidos.set(new Set());

    this.inasistenciaService
      .obtenerInasistencia(fechaInicio!, fechaFin!)
      .subscribe({
        next: () => this.reporteVisible.set(true),
      });
  }

  limpiar() {
    this.asistenciaForm.reset({ fechaInicio: this.primerDiaMes, fechaFin: this.hoyStr });
    this.inasistenciaService.inasistencia.set([]);
    this.inasistenciaService.error.set(null);
    this.reporteVisible.set(false);
    this.expandidos.set(new Set());
    this.mensajeError.set(null);
  }

  cambiarVista(v: 'estudiantes' | 'cursos' | 'cronologia') {
    this.vistaActiva.set(v);
  }
}