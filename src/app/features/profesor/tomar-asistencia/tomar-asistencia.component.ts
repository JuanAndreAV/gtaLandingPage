import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AsistenciasService, FilaAsistencia, ItemAsistencia } from '../../../services/gestion-academica/asistencias.service'; // ajusta
import { CursosDocenteService } from '../../../services/gestion-academica/cursos-docente.service';                           // ajusta

@Component({
  selector: 'app-tomar-asistencia',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './tomar-asistencia.component.html',
})
export class TomarAsistenciaComponent implements OnInit {
  private asistencias = inject(AsistenciasService);
  private cursos      = inject(CursosDocenteService);
  private route       = inject(ActivatedRoute);
  private cursoId     = this.route.snapshot.paramMap.get('id')!;

  readonly hoy = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD en hora local
  fecha = new FormControl(this.hoy, { nonNullable: true });
  private fechaSel = signal(this.hoy);

  curso     = signal<any>(null);
  filas     = signal<FilaAsistencia[]>([]);
  cargando  = signal(false);
  guardando = signal(false);
  errorMsg  = signal<string | null>(null);
  okMsg     = signal<string | null>(null);
  sinGuardar = signal(false);   // hay cambios sin enviar

  marcados  = computed(() => this.filas().filter(f => f.asistio !== null).length);
  presentes = computed(() => this.filas().filter(f => f.asistio === true).length);
  ausentes  = computed(() => this.filas().filter(f => f.asistio === false).length);
  pendientes = computed(() => this.filas().length - this.marcados());

  // Aviso si la fecha no corresponde a un día de clase
  esDiaDeClase = computed(() => {
    const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const dia = dias[new Date(this.fechaSel() + 'T00:00:00').getDay()];
    const horarios: any[] = this.curso()?.horarios ?? [];
    return !horarios.length || horarios.some(h => h.diaSemana === dia);
  });

  ngOnInit() {
    this.cursos.curso(this.cursoId).subscribe({
      next: c => this.curso.set(c),
      error: e => this.errorMsg.set(this.msg(e, 'No se pudo cargar el curso')),
    });
    this.cargar();
    this.fecha.valueChanges.subscribe(f => {
      if (this.sinGuardar() && !confirm('Tienes cambios sin guardar. ¿Cambiar de fecha igualmente?')) {
        this.fecha.setValue(this.fechaSel(), { emitEvent: false });
        return;
      }
      this.fechaSel.set(f);
      this.cargar();
    });
  }

  cargar() {
    if (!this.fecha.value) return;
    this.cargando.set(true);
    this.errorMsg.set(null);
    this.okMsg.set(null);
    this.sinGuardar.set(false);

    this.asistencias.lista(this.cursoId, this.fecha.value).subscribe({
      next: f => { this.filas.set(f); this.cargando.set(false); },
      error: e => { this.errorMsg.set(this.msg(e, 'No se pudo cargar la lista')); this.cargando.set(false); },
    });
  }

  marcar(i: number, asistio: boolean) {
    this.filas.update(l => l.map((f, idx) => idx === i ? { ...f, asistio } : f));
    this.sinGuardar.set(true);
  }

  nota(i: number, valor: string) {
    this.filas.update(l => l.map((f, idx) => idx === i ? { ...f, observacion: valor || null } : f));
    this.sinGuardar.set(true);
  }

  todosPresentes() {
    this.filas.update(l => l.map(f => ({ ...f, asistio: f.asistio ?? true })));
    this.sinGuardar.set(true);
  }

  guardar() {
    const items: ItemAsistencia[] = this.filas()
      .filter(f => f.asistio !== null)
      .map(f => ({
        inscripcionId: f.inscripcionId,
        asistio: f.asistio!,
        ...(f.observacion && { observacion: f.observacion }),
      }));
    if (!items.length) return;

    this.guardando.set(true);
    this.errorMsg.set(null);
    this.okMsg.set(null);

    this.asistencias.guardarMasivo(this.cursoId, this.fecha.value, items).subscribe({
      next: r => {
        this.okMsg.set(`Asistencia guardada (${r.procesadas} registros).`);
        this.sinGuardar.set(false);
        this.guardando.set(false);
      },
      error: e => { this.errorMsg.set(this.msg(e, 'No se pudo guardar')); this.guardando.set(false); },
    });
  }

  private msg(e: any, defecto: string): string {
    const m = e?.error?.message;
    return Array.isArray(m) ? m.join(', ') : (m ?? defecto);
  }
}