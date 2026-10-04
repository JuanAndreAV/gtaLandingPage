import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { finalize, distinctUntilChanged, startWith } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { InscripcionesService } from '../../../../services/gestion-academica/inscripciones.service';

interface Horario {
  diaSemana:  string;
  horaInicio: string;
  horaFin:    string;
  aula?:      { nombre: string };
}

interface CursoDisponible {
  id:                string;
  nombre:            string;
  descripcion:       string;
  asignatura:        string;
  programa:          string;
  programa_color:    string;
  periodo:           string;
  capacidad_max:     number;
  inscritos:         number;
  cupos_disponibles: number;
  en_espera:         number;
  estado_cupos:      'disponible' | 'lleno';
  edad_min:          number | null;
  edad_max:          number | null;
  horarios:          Horario[];
}

interface Programa   { id: string; nombre: string; }
interface Periodo    { id: string; nombre: string; }
interface Asignatura { id: string; nombre: string; }

@Component({
  selector: 'app-cursos-disponibles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './cursos-disponibles.component.html',
})
export class CursosDisponiblesComponent implements OnInit {
  private http   = inject(HttpClient);
  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  inscripciones  = inject(InscripcionesService);

  // Estado
  cursos       = signal<CursoDisponible[]>([]);
  areas        = signal<string[]>([]);
  programas    = signal<Programa[]>([]);
  asignaturas  = signal<Asignatura[]>([]);
  periodos     = signal<Periodo[]>([]);
  isLoading    = signal(false);
  inscribiendo = signal<string | null>(null);
  errorMsg     = signal<string | null>(null);
  exitoMsg     = signal<string | null>(null);

  inscripcionesPrevias = signal<any[]>([]);

  // Parámetros
  usuarioId = signal<string | null>(null);

  // Filtros
  filtroTexto        = new FormControl('');
  filtroArea         = new FormControl('');
  filtroProgramaId   = new FormControl('');
  filtroAsignaturaId = new FormControl('');
  filtroPeriodoId    = new FormControl('');

  // Observación para el docente
  observaciones = new FormControl('');

  // Los FormControl no son signals: se convierten para que computed reaccione
  private texto = toSignal(
    this.filtroTexto.valueChanges.pipe(startWith('')), { initialValue: '' }
  );
  private areaSel = toSignal(
    this.filtroArea.valueChanges.pipe(startWith('')), { initialValue: '' }
  );
  private asignaturaSelId = toSignal(
    this.filtroAsignaturaId.valueChanges.pipe(startWith('')), { initialValue: '' }
  );

  cursosFiltrados = computed(() => {
    const texto = (this.texto() ?? '').toLowerCase();

    // Área: programas() ya viene filtrado por área desde el backend
    const area = this.areaSel();
    const programasDelArea = new Set(this.programas().map(p => p.nombre));

    // Asignatura: se compara por nombre
    const asigId = this.asignaturaSelId();
    const asigNombre = asigId
      ? this.asignaturas().find(a => a.id === asigId)?.nombre
      : null;

    return this.cursos().filter(c =>
      (!area       || programasDelArea.has(c.programa)) &&
      (!asigNombre || c.asignatura === asigNombre) &&
      (!texto ||
        c.nombre.toLowerCase().includes(texto) ||
        c.asignatura.toLowerCase().includes(texto) ||
        c.programa.toLowerCase().includes(texto))
    );
  });

  cursosAgrupados = computed(() => {
    const grupos = new Map<string, CursoDisponible[]>();
    for (const curso of this.cursosFiltrados()) {
      if (!grupos.has(curso.programa)) grupos.set(curso.programa, []);
      grupos.get(curso.programa)!.push(curso);
    }
    return grupos;
  });

  ngOnInit() {
    this.usuarioId.set(this.route.snapshot.queryParamMap.get('usuarioId'));

    this.cargarAreas();
    this.cargarProgramas();
    this.cargarPeriodos();
    this.cargarCursos();
    this.cargarInscripcionesPrevias();

    // Área → recarga programas y limpia lo de abajo
    this.filtroArea.valueChanges.pipe(distinctUntilChanged()).subscribe(() => {
      this.filtroProgramaId.setValue('');
      this.filtroAsignaturaId.setValue('');
      this.asignaturas.set([]);
      this.cargarProgramas();
    });

    // Programa → recarga asignaturas y cursos
    this.filtroProgramaId.valueChanges.pipe(distinctUntilChanged()).subscribe(id => {
      this.filtroAsignaturaId.setValue('');
      this.asignaturas.set([]);
      if (id) this.cargarAsignaturas(id);
      this.cargarCursos();
    });

    this.filtroPeriodoId.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(() => this.cargarCursos());
  }

  // ── Carga de datos ─────────────────────────────────────────────

  cargarCursos() {
    this.isLoading.set(true);
    this.errorMsg.set(null);

    const params = new URLSearchParams();
    if (this.filtroProgramaId.value) params.set('programaId', this.filtroProgramaId.value);
    if (this.filtroPeriodoId.value)  params.set('periodoId',  this.filtroPeriodoId.value);
    if (this.usuarioId())            params.set('usuarioId',  this.usuarioId()!);

    this.http.get<CursoDisponible[]>(
      `${environment.baseUrl}/cursos/disponibles?${params.toString()}`
    ).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next:  data => this.cursos.set(data),
      error: err  => this.errorMsg.set(err.error?.message ?? 'Error al cargar cursos'),
    });
  }

  cargarAreas() {
    this.http.get<string[]>(`${environment.baseUrl}/programas/areas`)
      .subscribe(data => this.areas.set(data));
  }

  cargarProgramas() {
    const area = this.filtroArea.value;
    const qs = area ? `?area=${encodeURIComponent(area)}` : '';
    this.http.get<Programa[]>(`${environment.baseUrl}/programas${qs}`)
      .subscribe(data => this.programas.set(data));
  }

  cargarAsignaturas(programaId: string) {
    this.http.get<Asignatura[]>(`${environment.baseUrl}/asignaturas?programaId=${programaId}`)
      .subscribe(data => this.asignaturas.set(data));
  }

  cargarPeriodos() {
    this.http.get<Periodo[]>(`${environment.baseUrl}/programas/periodos`)
      .subscribe(data => this.periodos.set(data));
  }

  cargarInscripcionesPrevias() {
    if (!this.usuarioId()) return;

    this.inscripciones.listarPorEstudiante(this.usuarioId()!, true)
      .subscribe({
        next:  data => this.inscripcionesPrevias.set(data),
        error: ()   => this.inscripcionesPrevias.set([]),
      });
  }

  // ── Inscripción ────────────────────────────────────────────────

  Inscribir(cursoId: string, estadoCupos: string) {
    if (!this.usuarioId()) {
      this.errorMsg.set('No se identificó al estudiante. Vuelve al paso anterior.');
      return;
    }
    if (estadoCupos !== 'disponible') {
      this.errorMsg.set('Este curso no tiene cupos disponibles.');
      return;
    }

    this.inscribiendo.set(cursoId);
    this.errorMsg.set(null);
    this.exitoMsg.set(null);

    this.inscripciones.inscribirDirecto({
      usuarioId: this.usuarioId()!,
      cursoId,
      observaciones: this.observaciones.value?.trim() || undefined,
    }).pipe(
      finalize(() => this.inscribiendo.set(null))
    ).subscribe({
      next: (res: any) => {
        this.exitoMsg.set(res.mensaje ?? 'Inscripción realizada correctamente.');
        this.observaciones.reset('');
        this.cargarCursos();
        this.cargarInscripcionesPrevias();
      },
      error: err => {
        this.errorMsg.set(err.error?.message ?? 'Error al realizar la inscripción');
      }
    });
  }

  // ── Helpers de vista ───────────────────────────────────────────

  anchoBarra(curso: CursoDisponible): number {
    return Math.min((curso.inscritos / curso.capacidad_max) * 100, 100);
  }

  formatearHorario(horarios: Horario[]): string {
    return horarios.map(h =>
      `${this.capitalizarDia(h.diaSemana)} ${h.horaInicio}–${h.horaFin}`
      + (h.aula ? ` · ${h.aula.nombre}` : '')
    ).join(' / ');
  }

  edadLabel(min: number | null, max: number | null): string {
    if (!min && !max) return '';
    if (min && max)   return `${min}–${max} años`;
    if (min)          return `Desde ${min} años`;
    return            `Hasta ${max} años`;
  }

  programasArray() {
    return Array.from(this.cursosAgrupados().entries());
  }

  volver() {
    this.router.navigate(['admin/academico/registro-estudiante']);
  }

  private capitalizarDia(dia: string): string {
    return dia.charAt(0).toUpperCase() + dia.slice(1);
  }
}