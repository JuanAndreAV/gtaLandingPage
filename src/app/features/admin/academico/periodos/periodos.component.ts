import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ProgramasService } from '../../../../services/gestion-academica/programas.service';
import { Periodo, CreatePeriodoDto } from '../../../../models/gestion-academica/programa';
import { DatePipe } from '@angular/common';
import { AdminPageHeaderComponent } from '../../../../shared/components/admin/page-header/admin-page-header.component';
import { AdminModalComponent } from '../../../../shared/components/admin/modal/admin-modal.component';

type EstadoPeriodo = 'vigente' | 'proximo' | 'finalizado' | 'inactivo';
import { ConfirmPopupComponent } from '../../../shared/components/confirm-popup/confirm-popup.component';

@Component({
  selector: 'app-periodos',
  imports: [ReactiveFormsModule, DatePipe, ConfirmPopupComponent, AdminPageHeaderComponent, AdminModalComponent],
  templateUrl: './periodos.component.html',
  styleUrl: './periodos.component.css',
})
export class PeriodosComponent implements OnInit {

  programasService = inject(ProgramasService);

  modalAbierto = signal(false);
  modoEdicion = signal(false);
  guardando = signal(false);
  formularioEnviado = false;
  periodoEditando: Periodo | null = null;
  errorFechas = signal<string | null>(null);

  private readonly hoy = new Date().toLocaleDateString('en-CA');

  // Más recientes primero
  readonly periodosOrdenados = computed(() =>
    [...this.programasService.periodos()].sort((a, b) => b.fechaInicio.localeCompare(a.fechaInicio)));

  readonly vigente = computed(() => this.periodosOrdenados().find((p) => this.estado(p) === 'vigente') ?? null);

  confirmPopup = signal(false);
  periodo = signal<Periodo | null>(null);

  createPeriodoForm = new FormGroup({
    nombre: new FormControl('', Validators.required),
    fechaInicio: new FormControl('', Validators.required),
    fechaFin: new FormControl('', Validators.required),
  });

  //form: CreatePeriodoDto = { nombre: '', fechaInicio: '', fechaFin: '' };

  ngOnInit() {
    this.programasService.listarPeriodos().subscribe();
  }

  abrirModalNuevo() {
    this.modoEdicion.set(false);
    this.periodoEditando = null;
    this.createPeriodoForm.reset();
    this.formularioEnviado = false;
    this.errorFechas.set(null);
    this.modalAbierto.set(true);
  }

  editar(periodo: Periodo) {
    this.modoEdicion.set(true);
    this.periodoEditando = periodo;
    this.createPeriodoForm.patchValue({
      nombre: periodo.nombre,
      fechaInicio: periodo.fechaInicio.split('T')[0],
      fechaFin: periodo.fechaFin.split('T')[0],
    });
    this.formularioEnviado = false;
    this.errorFechas.set(null);
    this.modalAbierto.set(true);
  }

  cerrarModal() {
    this.modalAbierto.set(false);
  }

  guardar() {
    this.formularioEnviado = true;
    this.errorFechas.set(null);

    if (!this.createPeriodoForm.value.nombre || !this.createPeriodoForm.value.fechaInicio || !this.createPeriodoForm.value.fechaFin) return;
    if (this.createPeriodoForm.value.fechaFin <= this.createPeriodoForm.value.fechaInicio) {
      this.errorFechas.set('La fecha de fin debe ser posterior a la de inicio.');
      return;
    }

    this.guardando.set(true);
    const obs = this.modoEdicion() && this.periodoEditando
      ? this.programasService.actualizarPeriodo(this.periodoEditando.id, this.createPeriodoForm.value as Partial<CreatePeriodoDto>)
      : this.programasService.crearPeriodo(this.createPeriodoForm.value as CreatePeriodoDto);

    obs.subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarModal();
        this.programasService.listarPeriodos().subscribe();
      },
      error: (err) => {
        this.guardando.set(false);
        // el backend valida solapamiento de fechas -> mostramos su mensaje tal cual
        this.errorFechas.set(err.error?.message ?? 'Error al guardar el periodo');
      },
    });
  }

  // modal y confirmar o no desactivar
  desactivarModal(periodo: Periodo) {
      this.confirmPopup.set(true);
      this.periodo.set(periodo);
    }
    desactivar(estado: boolean | null) {
      if (!estado){
        this.confirmPopup.set(false);
        this.periodo.set(null);
        return
      }
      const periodoId = this.periodo()?.id;
      if (!periodoId) return;
       this.programasService.desactivarPeriodo(periodoId).subscribe({
        next: () => this.programasService.listarPeriodos().subscribe(),
        error: (err) => alert(err.error?.message ?? 'Error al desactivar'),
      });
      this.confirmPopup.set(false);
      this.periodo.set(null);
  
  
    }


  estado(p: Periodo): EstadoPeriodo {
    if (!p.activo) return 'inactivo';
    const inicio = p.fechaInicio.slice(0, 10), fin = p.fechaFin.slice(0, 10);
    if (this.hoy < inicio) return 'proximo';
    if (this.hoy > fin) return 'finalizado';
    return 'vigente';
  }

  semanas(p: Periodo): number {
    const ms = new Date(p.fechaFin.slice(0, 10)).getTime() - new Date(p.fechaInicio.slice(0, 10)).getTime();
    return Math.max(1, Math.round(ms / (7 * 86_400_000)));
  }

  /** % transcurrido del periodo vigente */
  avance(p: Periodo): number {
    const inicio = new Date(p.fechaInicio.slice(0, 10)).getTime();
    const fin = new Date(p.fechaFin.slice(0, 10)).getTime();
    const ahora = new Date(this.hoy).getTime();
    return Math.min(100, Math.max(0, Math.round(((ahora - inicio) / Math.max(1, fin - inicio)) * 100)));
  }

  campoInvalido(nombre: 'nombre' | 'fechaInicio' | 'fechaFin'): boolean {
    return this.formularioEnviado && !this.createPeriodoForm.value[nombre];
  }
}
