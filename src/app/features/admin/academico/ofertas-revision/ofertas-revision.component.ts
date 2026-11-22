import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { OfertasService } from '../../../../services/gestion-academica/ofertas.service';
import { NivelesService } from '../../../../services/gestion-academica/niveles.service';
import { ProgramasService } from '../../../../services/gestion-academica/programas.service';
import { AsignaturasService } from '../../../../services/gestion-academica/asignatura.service';
import { AulasService } from '../../../../services/gestion-academica/aulas.service';
import { Periodo } from '../../../../models/gestion-academica/programa';
import { Asignatura } from '../../../../models/gestion-academica/asignatura';
import { Aulas as Aula } from '../../../../models/gestion-academica/aulas';
import {
  DIAS, ESTADOS_OFERTA, EstadoOferta, HorarioOferta, Nivel, OfertaCurso,
} from '../../../../models/gestion-academica/oferta';

type Accion = 'aprobar' | 'devolver' | 'rechazar';

interface Revision {
  ofertaId: string;
  accion: Accion;
  area: string;
  asignaturaId: string;
  nivelId: string;
  aulaId: string;
  observacion: string;
}

@Component({
  selector: 'app-ofertas-revision',
  imports: [RouterLink],
  templateUrl: './ofertas-revision.component.html',
})
export class OfertasRevisionComponent implements OnInit {
  private ofertasService = inject(OfertasService);
  private nivelesService = inject(NivelesService);
  private programasService = inject(ProgramasService);
  private asignaturasService = inject(AsignaturasService);
  private aulasService = inject(AulasService);

  readonly dias = DIAS;
  readonly estadosOferta = ESTADOS_OFERTA;
  readonly filtrosEstado: (EstadoOferta | '')[] = ['pendiente', 'devuelta', 'aprobada', 'rechazada', ''];

  periodos = signal<Periodo[]>([]);
  periodoId = signal('');
  ofertas = signal<OfertaCurso[]>([]);
  asignaturas = signal<Asignatura[]>([]);
  aulas = signal<Aula[]>([]);
  nivelesPorAsignatura = signal<Record<string, Nivel[]>>({});

  cargando = signal(false);
  procesando = signal(false);
  filtroEstado = signal<EstadoOferta | ''>('pendiente');
  filtroDocente = signal('');
  busqueda = signal('');
  revision = signal<Revision | null>(null);
  errorRevision = signal<string | null>(null);
  mensajeError = signal<string | null>(null);
  mensajeExito = signal<string | null>(null);

  readonly conteo = computed(() => {
    const c: Partial<Record<string, number>> = { '': this.ofertas().length };
    for (const o of this.ofertas()) c[o.estado] = (c[o.estado] ?? 0) + 1;
    return c;
  });

  readonly docentes = computed(() => {
    const mapa = new Map<string, string>();
    for (const o of this.ofertas()) if (o.docente) mapa.set(o.docente.id, this.nombreDocente(o));
    return [...mapa.entries()].map(([id, nombre]) => ({ id, nombre })).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  });

  readonly filtradas = computed(() => {
    const q = this.normalizar(this.busqueda().trim());
    return this.ofertas().filter((o) => {
      if (this.filtroEstado() && o.estado !== this.filtroEstado()) return false;
      if (this.filtroDocente() && o.docenteId !== this.filtroDocente()) return false;
      if (q && !this.normalizar(`${o.nombre} ${o.asignaturaSugerida ?? ''} ${o.areaSugerida ?? ''} ${this.nombreDocente(o)}`).includes(q)) return false;
      return true;
    });
  });

  // Áreas artísticas derivadas de los programas a los que pertenece cada asignatura
  readonly areas = computed(() => {
    const set = new Set<string>();
    for (const a of this.asignaturas()) for (const area of this.areasDe(a)) set.add(area);
    return [...set].sort((a, b) => a.localeCompare(b, 'es'));
  });

  readonly asignaturasFiltradas = computed(() => {
    const area = this.revision()?.area;
    const activas = this.asignaturas().filter((a) => a.activo);
    return area ? activas.filter((a) => this.areasDe(a).includes(area)) : activas;
  });

  readonly nivelesRevision = computed(() => {
    const id = this.revision()?.asignaturaId;
    return id ? this.nivelesPorAsignatura()[id] ?? null : null;
  });

  ngOnInit(): void {
    forkJoin({
      periodos: this.programasService.listarPeriodos(),
      asignaturas: this.asignaturasService.listar(),
      aulas: this.aulasService.listar(),
    }).subscribe({
      next: ({ periodos, asignaturas, aulas }) => {
        this.periodos.set(periodos);
        this.asignaturas.set(asignaturas);
        this.aulas.set(aulas.filter((a) => a.activo));
        const actual = periodos.find((p) => p.activo) ?? periodos[0];
        if (actual) this.cambiarPeriodo(actual.id);
      },
      error: (e) => this.mensajeError.set(this.msg(e)),
    });
  }

  cambiarPeriodo(id: string) {
    this.periodoId.set(id);
    this.revision.set(null);
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.ofertasService.listar({ periodoId: this.periodoId() }).subscribe({
      next: (o) => { this.ofertas.set(o); this.cargando.set(false); },
      error: (e) => { this.mensajeError.set(this.msg(e)); this.cargando.set(false); },
    });
  }

  // ── Revisión ──
  iniciar(o: OfertaCurso, accion: Accion) {
    this.errorRevision.set(null);
    this.mensajeExito.set(null);
    const r: Revision = { ofertaId: o.id, accion, area: '', asignaturaId: '', nivelId: '', aulaId: '', observacion: '' };

    if (accion === 'aprobar') {
      // Propone la asignatura cuyo nombre coincide con la sugerida por el docente
      const sugerida = this.normalizar(o.asignaturaSugerida ?? '');
      const coincidencia = sugerida
        ? this.asignaturas().find((a) => a.activo && this.normalizar(a.nombre) === sugerida)
          ?? this.asignaturas().find((a) => a.activo && this.normalizar(a.nombre).includes(sugerida))
        : undefined;
      const areaSugerida = this.areas().find((a) => this.normalizar(a) === this.normalizar(o.areaSugerida ?? ''));
      r.area = coincidencia ? '' : areaSugerida ?? '';
      if (coincidencia) r.asignaturaId = coincidencia.id;
    }
    this.revision.set(r);
    if (r.asignaturaId) this.cargarNiveles(r.asignaturaId, o.nivelNumero);
  }

  cancelar() {
    this.revision.set(null);
    this.errorRevision.set(null);
  }

  cambiarArea(area: string) {
    this.revision.update((r) => r && { ...r, area, asignaturaId: '', nivelId: '' });
  }

  cambiarAsignatura(o: OfertaCurso, asignaturaId: string) {
    this.revision.update((r) => r && { ...r, asignaturaId, nivelId: '' });
    if (asignaturaId) this.cargarNiveles(asignaturaId, o.nivelNumero);
  }

  actualizar(campo: 'nivelId' | 'aulaId' | 'observacion', valor: string) {
    this.revision.update((r) => r && { ...r, [campo]: valor });
  }

  private cargarNiveles(asignaturaId: string, nivelNumero: number) {
    const preseleccionar = (niveles: Nivel[]) => {
      const nivel = niveles.find((n) => n.orden === nivelNumero && n.activo);
      this.revision.update((r) => (r && r.asignaturaId === asignaturaId ? { ...r, nivelId: nivel?.id ?? '' } : r));
    };
    const cache = this.nivelesPorAsignatura()[asignaturaId];
    if (cache) return preseleccionar(cache);
    this.nivelesService.listar(asignaturaId).subscribe((niveles) => {
      this.nivelesPorAsignatura.update((m) => ({ ...m, [asignaturaId]: niveles }));
      preseleccionar(niveles);
    });
  }

  confirmar(o: OfertaCurso) {
    const r = this.revision();
    if (!r) return;
    this.errorRevision.set(null);

    let peticion;
    if (r.accion === 'aprobar') {
      if (!r.asignaturaId || !r.aulaId) {
        this.errorRevision.set('Selecciona la asignatura y el salón.');
        return;
      }
      peticion = this.ofertasService.aprobar(o.id, { asignaturaId: r.asignaturaId, aulaId: r.aulaId, nivelId: r.nivelId || null });
    } else {
      if (!r.observacion.trim()) {
        this.errorRevision.set('Escribe el motivo para el docente.');
        return;
      }
      peticion = r.accion === 'rechazar'
        ? this.ofertasService.rechazar(o.id, r.observacion.trim())
        : this.ofertasService.devolver(o.id, r.observacion.trim());
    }

    this.procesando.set(true);
    peticion.subscribe({
      next: (res) => {
        this.mensajeExito.set(res.mensaje);
        this.procesando.set(false);
        this.revision.set(null);
        this.cargar();
      },
      error: (e) => { this.errorRevision.set(this.msg(e)); this.procesando.set(false); },
    });
  }

  // ── Presentación ──
  nombreDocente(o: OfertaCurso): string {
    const d = o.docente;
    return d ? `${d.nombre ?? ''} ${d.apellido ?? ''}`.trim() || d.email : 'Docente';
  }

  textoHorarios(horarios: HorarioOferta[]): string {
    return horarios
      .map((h) => `${this.dias.find((d) => d.valor === h.diaSemana)?.etiqueta ?? h.diaSemana} ${h.horaInicio}–${h.horaFin}`)
      .join(' · ');
  }

  textoEdades(min: number | null, max: number | null): string {
    if (min != null && max != null) return `${min} a ${max} años`;
    if (min != null) return `desde ${min} años`;
    if (max != null) return `hasta ${max} años`;
    return 'Todas las edades';
  }

  etiquetaFiltro(e: EstadoOferta | ''): string {
    return e ? this.estadosOferta[e].etiqueta : 'Todos';
  }

  aulaPequena(o: OfertaCurso): boolean {
    const aula = this.aulas().find((a) => a.id === this.revision()?.aulaId);
    return !!aula?.capacidad && aula.capacidad < o.capacidadMax;
  }

  areasDe(a: Asignatura): string[] {
    return (a.pensum ?? []).map((p) => (p.programa as any)?.area).filter(Boolean);
  }

  private normalizar(s: string): string {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
  }

  private msg(e: any, defecto = 'Ocurrió un error inesperado'): string {
    const m = e?.error?.message;
    return Array.isArray(m) ? m.join('. ') : (m ?? defecto);
  }
}
