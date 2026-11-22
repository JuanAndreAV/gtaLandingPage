import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OfertasService } from '../../../services/gestion-academica/ofertas.service';
import { ProgramasService } from '../../../services/gestion-academica/programas.service';
import { Periodo } from '../../../models/gestion-academica/programa';
import {
  CursoOfertaDatos, DIAS, ESTADOS_OFERTA, EstadoOferta, HorarioOferta, OfertaCurso, PrevisualizacionOferta,
} from '../../../models/gestion-academica/oferta';

const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

@Component({
  selector: 'app-mi-oferta',
  imports: [ReactiveFormsModule],
  templateUrl: './mi-oferta.component.html',
})
export class MiOfertaComponent implements OnInit {
  private ofertasService = inject(OfertasService);
  private programasService = inject(ProgramasService);
  private fb = inject(FormBuilder);

  readonly dias = DIAS;
  readonly estadosOferta = ESTADOS_OFERTA;
  readonly filtrosEstado: (EstadoOferta | '')[] = ['', 'pendiente', 'devuelta', 'aprobada', 'rechazada'];

  periodos = signal<Periodo[]>([]);
  periodoId = signal('');
  ofertas = signal<OfertaCurso[]>([]);
  cargando = signal(false);
  filtroEstado = signal<EstadoOferta | ''>('');

  // Carga del Excel
  archivo = signal<File | null>(null);
  previsualizacion = signal<PrevisualizacionOferta | null>(null);
  leyendo = signal(false);
  enviando = signal(false);
  descargando = signal(false);

  // Edición
  editando = signal<OfertaCurso | null>(null);
  guardando = signal(false);
  errorFormulario = signal<string | null>(null);

  mensajeError = signal<string | null>(null);
  mensajeExito = signal<string | null>(null);

  readonly conteo = computed(() => {
    const c: Partial<Record<string, number>> = { '': this.ofertas().length };
    for (const o of this.ofertas()) c[o.estado] = (c[o.estado] ?? 0) + 1;
    return c;
  });

  readonly ofertasFiltradas = computed(() => {
    const e = this.filtroEstado();
    return e ? this.ofertas().filter((o) => o.estado === e) : this.ofertas();
  });

  readonly periodoActual = computed(() => this.periodos().find((p) => p.id === this.periodoId()));

  form: FormGroup = this.fb.group({
    tipoEstudiante: ['nuevo', Validators.required],
    nivelNumero: [1, [Validators.required, Validators.min(1)]],
    nombre: ['', [Validators.required, Validators.maxLength(150)]],
    descripcion: [''],
    areaSugerida: [''],
    asignaturaSugerida: [''],
    edadMin: [null as number | null, [Validators.min(0), Validators.max(120)]],
    edadMax: [null as number | null, [Validators.min(0), Validators.max(120)]],
    capacidadMax: [20, [Validators.required, Validators.min(1)]],
    intensidadHoraria: [null as number | null, [Validators.min(0)]],
    observaciones: [''],
    horarios: this.fb.array([]),
  });

  get horariosForm(): FormArray<FormGroup> {
    return this.form.get('horarios') as FormArray<FormGroup>;
  }

  ngOnInit(): void {
    this.programasService.listarPeriodos().subscribe((periodos) => {
      const activos = periodos.filter((p) => p.activo);
      this.periodos.set(activos);
      if (activos.length) this.cambiarPeriodo(activos[0].id);
    });
  }

  cambiarPeriodo(id: string) {
    this.periodoId.set(id);
    this.cargarOfertas();
  }

  cargarOfertas() {
    if (!this.periodoId()) return;
    this.cargando.set(true);
    this.ofertasService.mias(this.periodoId()).subscribe({
      next: (o) => { this.ofertas.set(o); this.cargando.set(false); },
      error: (e) => { this.mensajeError.set(this.msg(e)); this.cargando.set(false); },
    });
  }

  // ── Excel ──
  descargarPlantilla() {
    this.descargando.set(true);
    this.ofertasService.descargarPlantilla().subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'plantilla-oferta-cursos.xlsx';
        a.click();
        URL.revokeObjectURL(url);
        this.descargando.set(false);
      },
      error: (e) => { this.mensajeError.set(this.msg(e, 'No se pudo descargar la plantilla')); this.descargando.set(false); },
    });
  }

  seleccionarArchivo(evento: Event) {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    input.value = ''; // permite volver a elegir el mismo archivo tras corregirlo
    if (!archivo) return;

    this.limpiarMensajes();
    this.archivo.set(archivo);
    this.previsualizacion.set(null);
    this.leyendo.set(true);
    this.ofertasService.previsualizar(archivo).subscribe({
      next: (p) => { this.previsualizacion.set(p); this.leyendo.set(false); },
      error: (e) => { this.mensajeError.set(this.msg(e, 'No se pudo leer el archivo')); this.leyendo.set(false); this.archivo.set(null); },
    });
  }

  cancelarCarga() {
    this.archivo.set(null);
    this.previsualizacion.set(null);
  }

  enviarOferta() {
    const p = this.previsualizacion();
    if (!p || !p.validas || !this.periodoId()) return;
    if (p.conErrores && !confirm(
      `${p.conErrores} curso(s) tienen errores y no se enviarán. ¿Enviar los ${p.validas} cursos correctos? Puedes cargar los demás después de corregirlos.`,
    )) return;

    const cursos = p.filas.filter((f) => !f.errores.length).map((f) => f.curso as CursoOfertaDatos);
    this.enviando.set(true);
    this.ofertasService.enviar(this.periodoId(), cursos, this.archivo()?.name).subscribe({
      next: (r) => {
        this.mensajeExito.set(`Se enviaron ${r.creadas} curso(s) para revisión de coordinación.`);
        this.enviando.set(false);
        this.cancelarCarga();
        this.filtroEstado.set('');
        this.cargarOfertas();
      },
      error: (e) => { this.mensajeError.set(this.msg(e)); this.enviando.set(false); },
    });
  }

  // ── Edición de una oferta pendiente o devuelta ──
  abrirEditar(o: OfertaCurso) {
    this.limpiarMensajes();
    this.form.reset({
      tipoEstudiante: o.tipoEstudiante, nivelNumero: o.nivelNumero, nombre: o.nombre,
      descripcion: o.descripcion ?? '', areaSugerida: o.areaSugerida ?? '', asignaturaSugerida: o.asignaturaSugerida ?? '',
      edadMin: o.edadMin, edadMax: o.edadMax, capacidadMax: o.capacidadMax,
      intensidadHoraria: o.intensidadHoraria === null ? null : Number(o.intensidadHoraria),
      observaciones: o.observaciones ?? '',
    });
    this.horariosForm.clear();
    o.horarios.forEach((h) => this.horariosForm.push(this.grupoHorario(h)));
    this.editando.set(o);
  }

  cerrarEditar() {
    this.editando.set(null);
    this.errorFormulario.set(null);
  }

  agregarHorario() {
    if (this.horariosForm.length >= 3) return; // un curso se dicta de 1 a 3 veces por semana
    this.horariosForm.push(this.grupoHorario());
  }

  quitarHorario(i: number) {
    this.horariosForm.removeAt(i);
  }

  guardarEdicion() {
    const o = this.editando();
    if (!o) return;
    this.errorFormulario.set(null);
    if (this.form.invalid || !this.horariosForm.length) {
      this.form.markAllAsTouched();
      this.errorFormulario.set(this.horariosForm.length ? 'Revisa los campos marcados.' : 'Agrega al menos un horario.');
      return;
    }
    const v = this.form.getRawValue();
    const horarios: HorarioOferta[] = v.horarios;
    if (horarios.some((h) => h.horaFin <= h.horaInicio)) {
      this.errorFormulario.set('En cada horario la hora de fin debe ser posterior a la de inicio.');
      return;
    }

    const datos: Partial<CursoOfertaDatos> = {
      tipoEstudiante: v.tipoEstudiante,
      nivelNumero: Number(v.nivelNumero),
      nombre: v.nombre.trim(),
      descripcion: v.descripcion?.trim() || null,
      areaSugerida: v.areaSugerida?.trim() || null,
      asignaturaSugerida: v.asignaturaSugerida?.trim() || null,
      edadMin: this.numero(v.edadMin),
      edadMax: this.numero(v.edadMax),
      capacidadMax: Number(v.capacidadMax),
      intensidadHoraria: this.numero(v.intensidadHoraria),
      observaciones: v.observaciones?.trim() || null,
      horarios,
    };

    this.guardando.set(true);
    this.ofertasService.actualizar(o.id, datos).subscribe({
      next: (actualizada) => {
        this.ofertas.update((l) => l.map((x) => (x.id === o.id ? { ...x, ...actualizada } : x)));
        this.mensajeExito.set(o.estado === 'devuelta'
          ? `"${actualizada.nombre}" se corrigió y se reenvió a coordinación.`
          : `"${actualizada.nombre}" se actualizó.`);
        this.guardando.set(false);
        this.cerrarEditar();
      },
      error: (e) => { this.errorFormulario.set(this.msg(e)); this.guardando.set(false); },
    });
  }

  retirar(o: OfertaCurso) {
    if (!confirm(`¿Retirar "${o.nombre}" de tu oferta?`)) return;
    this.limpiarMensajes();
    this.ofertasService.retirar(o.id).subscribe({
      next: (r) => {
        this.ofertas.update((l) => l.filter((x) => x.id !== o.id));
        this.mensajeExito.set(r.mensaje);
      },
      error: (e) => this.mensajeError.set(this.msg(e)),
    });
  }

  // ── Presentación ──
  textoHorarios(horarios: HorarioOferta[] | undefined): string {
    return (horarios ?? [])
      .map((h) => `${this.dias.find((d) => d.valor === h.diaSemana)?.etiqueta ?? h.diaSemana} ${h.horaInicio}–${h.horaFin}`)
      .join(' · ');
  }

  textoEdades(min: number | null | undefined, max: number | null | undefined): string {
    if (min != null && max != null) return `${min} a ${max} años`;
    if (min != null) return `desde ${min} años`;
    if (max != null) return `hasta ${max} años`;
    return 'Todas las edades';
  }

  etiquetaFiltro(e: EstadoOferta | ''): string {
    return e ? this.estadosOferta[e].etiqueta : 'Todos';
  }

  editable(o: OfertaCurso): boolean {
    return o.estado === 'pendiente' || o.estado === 'devuelta';
  }

  campoInvalido(nombre: string): boolean {
    const c = this.form.get(nombre);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  private grupoHorario(h?: HorarioOferta): FormGroup {
    return this.fb.group({
      diaSemana: [h?.diaSemana ?? 'lunes', Validators.required],
      horaInicio: [h?.horaInicio ?? '', [Validators.required, Validators.pattern(HORA)]],
      horaFin: [h?.horaFin ?? '', [Validators.required, Validators.pattern(HORA)]],
    });
  }

  private numero(v: unknown): number | null {
    return v === null || v === undefined || v === '' ? null : Number(v);
  }

  private limpiarMensajes() {
    this.mensajeError.set(null);
    this.mensajeExito.set(null);
  }

  private msg(e: any, defecto = 'Ocurrió un error inesperado'): string {
    const m = e?.error?.message;
    return Array.isArray(m) ? m.join('. ') : (m ?? defecto);
  }
}
