import {
  Component, inject, signal, computed, OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { finalize, debounceTime, distinctUntilChanged } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { InscripcionesService } from '../../../../services/gestion-academica/inscripciones.service';

interface Horario {
  diaSemana:  string;
  horaInicio: string;
  horaFin:    string;
  aula?:      { nombre: string };
}

interface CursoDisponible {
  id:               string;
  nombre:           string;
  descripcion:      string;
  asignatura:       string;
  programa:         string;
  programa_color:   string;
  periodo:          string;
  capacidad_max:    number;
  inscritos:        number;
  cupos_disponibles: number;
  en_espera:        number;
  estado_cupos:     'disponible' | 'lleno';
  edad_min:         number | null;
  edad_max:         number | null;
  horarios:         Horario[];
}

interface Programa { id: string; nombre: string; }
interface Periodo  { id: string; nombre: string; }

@Component({
  selector: 'app-cursos-disponibles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cursos-disponibles.component.html',
})
export class CursosDisponiblesComponent implements OnInit {
  private http   = inject(HttpClient);
  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  inscripciones  = inject(InscripcionesService);

  // Estado
  cursos       = signal<CursoDisponible[]>([]);
  programas    = signal<Programa[]>([]);
  periodos     = signal<Periodo[]>([]);
  isLoading    = signal(false);
  inscribiendo = signal<string | null>(null); // id del curso en proceso
  errorMsg     = signal<string | null>(null);
  exitoMsg     = signal<string | null>(null);

  // Parámetros
  usuarioId  = signal<string | null>(null);

  // Filtros
  filtroProgramaId = new FormControl('');
  filtroPeriodoId  = new FormControl('');
  filtroTexto      = new FormControl('');

  // Cursos filtrados por búsqueda de texto
  cursosFiltrados = computed(() => {
    const texto = this.filtroTexto.value?.toLowerCase() ?? '';
    if (!texto) return this.cursos();
    return this.cursos().filter(c =>
      c.nombre.toLowerCase().includes(texto) ||
      c.asignatura.toLowerCase().includes(texto) ||
      c.programa.toLowerCase().includes(texto)
    );
  });

  // Agrupados por programa
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
    this.cargarProgramas();
    this.cargarPeriodos();
    this.cargarCursos();

    // Recargar cuando cambian los filtros de select
    this.filtroProgramaId.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(() => this.cargarCursos());

    this.filtroPeriodoId.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(() => this.cargarCursos());
  }

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

  cargarProgramas() {
    this.http.get<Programa[]>(`${environment.baseUrl}/programas`)
      .subscribe(data => this.programas.set(data));
  }

  cargarPeriodos() {
    this.http.get<Periodo[]>(`${environment.baseUrl}/programas/periodos`)
      .subscribe(data => this.periodos.set(data));
  }

  preInscribir(cursoId: string, estadoCupos: string) {
    if (!this.usuarioId()) {
      this.errorMsg.set('No se identificó al estudiante. Vuelve al paso anterior.');
      return;
    }

    this.inscribiendo.set(cursoId);
    this.errorMsg.set(null);
    this.exitoMsg.set(null);

    this.inscripciones.preInscribir({
      usuarioId: this.usuarioId()!,
      cursoId,
    }).pipe(
      finalize(() => this.inscribiendo.set(null))
    ).subscribe({
      next: (res: any) => {
        this.exitoMsg.set(res.mensaje ?? 'Pre-inscripción realizada correctamente.');
        this.cargarCursos(); // refrescar cupos
      },
      error: err => {
        this.errorMsg.set(err.error?.message ?? 'Error al realizar la pre-inscripción');
      }
    });
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
    this.router.navigate(['../registro-estudiante']);
  }

  private capitalizarDia(dia: string): string {
    return dia.charAt(0).toUpperCase() + dia.slice(1);
  }
}