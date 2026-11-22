import { Component, inject, signal, computed, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  AsistenciasService, ClaseNoRealizada, EstadoAsistencia, FilaAsistencia, HistorialCurso, ItemAsistencia,
  MOTIVOS_NO_REALIZADA, MotivoNoRealizada, ResumenAsistencia,
} from '../../../services/gestion-academica/asistencias.service';
import { CursosDocenteService } from '../../../services/gestion-academica/cursos-docente.service';

type Riesgo = 'riesgo' | 'atencion' | 'ok' | 'sin-datos';

export const ESTADOS: { valor: EstadoAsistencia; etiqueta: string; corta: string; activo: string; celda: string }[] = [
  { valor: 'presente', etiqueta: 'Presente', corta: 'P', activo: 'bg-emerald-600 text-white ring-emerald-600', celda: 'bg-emerald-100 text-emerald-800' },
  { valor: 'tarde',    etiqueta: 'Tarde',    corta: 'T', activo: 'bg-amber-500 text-white ring-amber-500',     celda: 'bg-amber-100 text-amber-800' },
  { valor: 'excusa',   etiqueta: 'Excusa',   corta: 'E', activo: 'bg-sky-600 text-white ring-sky-600',         celda: 'bg-sky-100 text-sky-800' },
  { valor: 'ausente',  etiqueta: 'Ausente',  corta: 'A', activo: 'bg-red-600 text-white ring-red-600',         celda: 'bg-red-100 text-red-800' },
];

@Component({
  selector: 'app-tomar-asistencia',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './tomar-asistencia.component.html',
})
export class TomarAsistenciaComponent implements OnInit {
  private asistencias = inject(AsistenciasService);
  private cursos      = inject(CursosDocenteService);
  private route       = inject(ActivatedRoute);
  private cursoId     = this.route.snapshot.paramMap.get('id')!;

  readonly estados = ESTADOS;
  readonly hoy = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD en hora local
  // ?fecha=YYYY-MM-DD abre directamente una clase pendiente (desde Mi horario)
  private readonly fechaInicial = this.fechaValida(this.route.snapshot.queryParamMap.get('fecha')) ?? this.hoy;
  fecha = new FormControl(this.fechaInicial, { nonNullable: true });
  private fechaSel = signal(this.fechaInicial);

  vista      = signal<'lista' | 'historial'>('lista');
  curso      = signal<any>(null);
  filas      = signal<FilaAsistencia[]>([]);
  historial  = signal<HistorialCurso | null>(null);
  cargando   = signal(false);
  cargandoHistorial = signal(false);
  guardando  = signal(false);
  errorMsg   = signal<string | null>(null);
  okMsg      = signal<string | null>(null);
  sinGuardar = signal(false);
  busqueda   = signal('');
  soloRiesgo = signal(false);

  // ── Clase no realizada ──
  readonly motivos = MOTIVOS_NO_REALIZADA;
  noRealizadas = signal<ClaseNoRealizada[]>([]);
  formNoRealizada = signal<{ motivo: MotivoNoRealizada; observacion: string } | null>(null);
  guardandoMarca = signal(false);
  readonly marcaFecha = computed(() => this.noRealizadas().find((n) => n.fecha === this.fechaSel()) ?? null);

  readonly minimo = computed(() => Number(this.curso()?.porcentajeAsistenciaMin ?? 80));

  readonly conteo = computed(() => {
    const c: Record<EstadoAsistencia | 'pendiente', number> = { presente: 0, tarde: 0, excusa: 0, ausente: 0, pendiente: 0 };
    for (const f of this.filas()) c[f.estado ?? 'pendiente']++;
    return c;
  });
  readonly marcados = computed(() => this.filas().length - this.conteo().pendiente);
  readonly enRiesgo = computed(() => this.filas().filter((f) => this.riesgo(f.resumen) === 'riesgo').length);

  // Índice original + fila, para que marcar() siga funcionando con filtros
  readonly filasVisibles = computed(() => {
    const q = this.normalizar(this.busqueda().trim());
    return this.filas()
      .map((f, i) => ({ f, i }))
      .filter(({ f }) => {
        if (this.soloRiesgo() && this.riesgo(f.resumen) === 'ok') return false;
        if (!q) return true;
        return this.normalizar(`${f.nombre ?? ''} ${f.apellido ?? ''} ${f.documento ?? ''}`).includes(q);
      });
  });

  esDiaDeClase = computed(() => {
    const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const dia = dias[new Date(this.fechaSel() + 'T00:00:00').getDay()];
    const horarios: any[] = this.curso()?.horarios ?? [];
    return !horarios.length || horarios.some((h) => h.diaSemana === dia);
  });

  ngOnInit() {
    this.cursos.curso(this.cursoId).subscribe({
      next: (c) => this.curso.set(c),
      error: (e) => this.errorMsg.set(this.msg(e, 'No se pudo cargar el curso')),
    });
    this.cargar();
    this.cargarNoRealizadas();
    this.fecha.valueChanges.subscribe((f) => {
      if (this.sinGuardar() && !confirm('Tienes cambios sin guardar. ¿Cambiar de fecha igualmente?')) {
        this.fecha.setValue(this.fechaSel(), { emitEvent: false });
        return;
      }
      this.fechaSel.set(f);
      this.formNoRealizada.set(null);
      this.cargar();
    });
  }

  // Evita cerrar la pestaña con la lista a medio guardar
  @HostListener('window:beforeunload', ['$event'])
  avisarCambios(e: BeforeUnloadEvent) {
    if (this.sinGuardar()) e.preventDefault();
  }

  cambiarVista(v: 'lista' | 'historial') {
    this.vista.set(v);
    if (v === 'historial' && !this.historial()) this.cargarHistorial();
  }

  // Desde el historial: abrir una fecha para corregirla
  abrirFecha(fecha: string) {
    this.vista.set('lista');
    if (fecha !== this.fecha.value) this.fecha.setValue(fecha);
  }

  cargar() {
    if (!this.fecha.value) return;
    this.cargando.set(true);
    this.errorMsg.set(null);
    this.okMsg.set(null);
    this.sinGuardar.set(false);

    this.asistencias.lista(this.cursoId, this.fecha.value).subscribe({
      next: (f) => { this.filas.set(f); this.cargando.set(false); },
      error: (e) => { this.errorMsg.set(this.msg(e, 'No se pudo cargar la lista')); this.cargando.set(false); },
    });
  }

  cargarHistorial() {
    this.cargandoHistorial.set(true);
    this.asistencias.historialCurso(this.cursoId).subscribe({
      next: (h) => { this.historial.set(h); this.cargandoHistorial.set(false); },
      error: (e) => { this.errorMsg.set(this.msg(e, 'No se pudo cargar el historial')); this.cargandoHistorial.set(false); },
    });
  }

  marcar(i: number, estado: EstadoAsistencia) {
    this.filas.update((l) => l.map((f, idx) => (idx === i ? { ...f, estado, asistio: estado === 'presente' || estado === 'tarde' } : f)));
    this.sinGuardar.set(true);
    this.okMsg.set(null);
  }

  nota(i: number, valor: string) {
    this.filas.update((l) => l.map((f, idx) => (idx === i ? { ...f, observacion: valor || null } : f)));
    this.sinGuardar.set(true);
  }

  todosPresentes() {
    this.filas.update((l) => l.map((f) => (f.estado ? f : { ...f, estado: 'presente', asistio: true })));
    this.sinGuardar.set(true);
  }

  guardar() {
    const items: ItemAsistencia[] = this.filas()
      .filter((f) => f.estado !== null)
      .map((f) => ({
        inscripcionId: f.inscripcionId,
        estado: f.estado!,
        ...(f.observacion && { observacion: f.observacion }),
      }));
    if (!items.length) return;

    this.guardando.set(true);
    this.errorMsg.set(null);
    this.okMsg.set(null);

    this.asistencias.guardarMasivo(this.cursoId, this.fecha.value, items).subscribe({
      next: (r) => {
        this.okMsg.set(`Asistencia guardada (${r.procesadas} registros).`);
        this.sinGuardar.set(false);
        this.guardando.set(false);
        this.historial.set(null);  // se recarga al abrir la pestaña
        this.cargar();             // refresca los porcentajes
        // Si la fecha estaba marcada como no realizada, el API quitó la marca
        this.noRealizadas.update((l) => l.filter((n) => n.fecha !== this.fecha.value));
      },
      error: (e) => { this.errorMsg.set(this.msg(e, 'No se pudo guardar')); this.guardando.set(false); },
    });
  }

  // ── Clase no realizada ──
  cargarNoRealizadas() {
    this.asistencias.noRealizadas(this.cursoId).subscribe({
      next: (l) => this.noRealizadas.set(l),
      error: () => this.noRealizadas.set([]),
    });
  }

  abrirNoRealizada() {
    const m = this.marcaFecha();
    this.formNoRealizada.set({ motivo: m?.motivo ?? 'vacaciones', observacion: m?.observacion ?? '' });
  }

  actualizarFormNoRealizada(campo: 'motivo' | 'observacion', valor: string) {
    this.formNoRealizada.update((f) => f && { ...f, [campo]: valor });
  }

  guardarNoRealizada() {
    const f = this.formNoRealizada();
    if (!f) return;
    if (f.motivo === 'otro' && !f.observacion.trim()) {
      this.errorMsg.set('Describe el motivo por el que no se dictó la clase.');
      return;
    }
    if (this.marcados() > 0 && !confirm('Esta fecha tiene marcas de asistencia sin guardar que se descartarán. ¿Continuar?')) return;

    this.guardandoMarca.set(true);
    this.errorMsg.set(null);
    this.asistencias.marcarNoRealizada(this.cursoId, {
      fecha: this.fecha.value,
      motivo: f.motivo,
      ...(f.observacion.trim() && { observacion: f.observacion.trim() }),
    }).subscribe({
      next: (marca) => {
        this.noRealizadas.update((l) => [...l.filter((n) => n.fecha !== marca.fecha), marca]);
        this.formNoRealizada.set(null);
        this.guardandoMarca.set(false);
        this.sinGuardar.set(false);
        this.okMsg.set('Se registró que la clase no se dictó. No contará como asistencia pendiente.');
        this.cargar();
      },
      error: (e) => { this.errorMsg.set(this.msg(e, 'No se pudo registrar')); this.guardandoMarca.set(false); },
    });
  }

  quitarMarca() {
    const m = this.marcaFecha();
    if (!m || !confirm('¿Quitar la marca de clase no realizada? Esta fecha volverá a quedar pendiente de asistencia.')) return;
    this.asistencias.quitarNoRealizada(m.id).subscribe({
      next: () => { this.noRealizadas.update((l) => l.filter((n) => n.id !== m.id)); this.okMsg.set(null); },
      error: (e) => this.errorMsg.set(this.msg(e, 'No se pudo quitar la marca')),
    });
  }

  etiquetaMotivo(m: MotivoNoRealizada): string {
    return this.motivos.find((x) => x.valor === m)?.etiqueta ?? m;
  }

  // ── Presentación ──
  riesgo(r: ResumenAsistencia | undefined): Riesgo {
    if (!r || r.porcentaje === null) return 'sin-datos';
    if (r.porcentaje < this.minimo()) return 'riesgo';
    if (r.porcentaje < this.minimo() + 10) return 'atencion';
    return 'ok';
  }

  claseRiesgo(r: ResumenAsistencia | undefined): string {
    switch (this.riesgo(r)) {
      case 'riesgo':   return 'bg-red-50 text-red-700 ring-red-200';
      case 'atencion': return 'bg-amber-50 text-amber-800 ring-amber-200';
      case 'ok':       return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
      default:         return 'bg-gray-50 text-gray-500 ring-gray-200';
    }
  }

  detalleResumen(r: ResumenAsistencia): string {
    return `${r.sesiones} clases · ${r.presentes} presente · ${r.tardes} tarde · ${r.excusas} excusa · ${r.ausentes} ausente`;
  }

  estado(valor: EstadoAsistencia | null | undefined) {
    return this.estados.find((e) => e.valor === valor);
  }

  fechaCorta(f: string): { dia: string; mes: string; semana: string } {
    const d = new Date(f + 'T00:00:00');
    return {
      dia: String(d.getDate()),
      mes: d.toLocaleDateString('es-CO', { month: 'short' }).replace('.', ''),
      semana: d.toLocaleDateString('es-CO', { weekday: 'short' }).replace('.', ''),
    };
  }

  private fechaValida(f: string | null): string | null {
    return f && /^\d{4}-\d{2}-\d{2}$/.test(f) && f <= this.hoy ? f : null;
  }

  private normalizar(s: string): string {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  private msg(e: any, defecto: string): string {
    const m = e?.error?.message;
    return Array.isArray(m) ? m.join(', ') : (m ?? defecto);
  }
}
