// cursos-admin.component.ts
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CursosService } from '../../../../services/gestion-academica/cursos.service';
import { AsignaturasService } from '../../../../services/gestion-academica/asignatura.service';
import { ProgramasService } from '../../../../services/gestion-academica/programas.service';
import { AulasService } from '../../../../services/gestion-academica/aulas.service';
import { DocentesService } from '../../../../services/gestion-academica/docentes.service';
import { Curso, CreateCursoDto, DiaSemana, CreateHorarioDto, Horario } from '../../../../models/gestion-academica/curso';
import { TitleComponent } from '../../../../shared/components/title/title.component';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ConfirmPopupComponent } from '../../../shared/components/confirm-popup/confirm-popup.component';

@Component({
  selector: 'app-cursos-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmPopupComponent, SpinnerComponent, TitleComponent],
  templateUrl: './cursos-admin.component.html',
})
export class CursosAdminComponent implements OnInit {
  cursosService = inject(CursosService);
  asignaturasService = inject(AsignaturasService);
  programasService = inject(ProgramasService);
  aulasService = inject(AulasService);
  docentesService = inject(DocentesService);

  diasSemana = Object.values(DiaSemana);

  // ── Filtros ─────────────────────────────────────────────
  filtroPeriodo = signal<string>('');
  filtroAsignatura = signal<string>('');

  // ── Modal curso ─────────────────────────────────────────
  modalAbierto = signal(false);
  modoEdicion = signal(false);
  guardando = signal(false);
  formularioEnviado = false;
  errorGuardado = signal<string | null>(null);
  cursoEditando: Curso | null = null;

  // ── Modal desactivar curso ───────────────────────────────
  confirmPopup = signal(false);
  curso = signal<Curso | null>(null);

  form: CreateCursoDto = this.formVacio();

  // ── Horarios (dentro del modal) ─────────────────────────
  horariosPendientes = signal<CreateHorarioDto[]>([]); // para curso nuevo, antes de crear
  horariosGuardados = signal<Horario[]>([]); // para curso existente, ya en BD
  nuevoHorario: CreateHorarioDto = { diaSemana: DiaSemana.LUNES, horaInicio: '', horaFin: '', aulaId: undefined };
  errorHorario = signal<string | null>(null);

  ngOnInit() {
    this.cursosService.listar().subscribe();
    this.asignaturasService.listar().subscribe();
    this.programasService.listarPeriodos().subscribe();
    this.aulasService.listar().subscribe();
    this.docentesService.listar().subscribe();
  }

  private formVacio(): CreateCursoDto {
    return {
      asignaturaId: '', periodoId: '', docenteId: undefined,
      nombre: '', descripcion: '', capacidadMax: 20,
      edadMin: undefined, edadMax: undefined, intensidadHoraria: undefined,
      porcentajeAsistenciaMin: 80, notaAprobatoria: 3,
      requiereNivelPrevio: false, cursoPrerequisitorId: undefined,
    };
  }

  onFiltroChange() {
    this.cursosService.listar({
      periodoId: this.filtroPeriodo() || undefined,
      asignaturaId: this.filtroAsignatura() || undefined,
    }).subscribe();
  }

  // ── Modal principal ─────────────────────────────────────
  abrirModalNuevo() {
    this.modoEdicion.set(false);
    this.cursoEditando = null;
    this.form = this.formVacio();
    this.horariosPendientes.set([]);
    this.horariosGuardados.set([]);
    this.formularioEnviado = false;
    this.errorGuardado.set(null);
    this.modalAbierto.set(true);
  }

  editar(curso: Curso) {
    this.modoEdicion.set(true);
    this.cursoEditando = curso;
    this.form = {
      asignaturaId: curso.asignaturaId,
      periodoId: curso.periodoId,
      docenteId: curso.docenteId ?? undefined,
      nombre: curso.nombre,
      descripcion: curso.descripcion ?? '',
      capacidadMax: curso.capacidadMax,
      edadMin: curso.edadMin ?? undefined,
      edadMax: curso.edadMax ?? undefined,
      intensidadHoraria: curso.intensidadHoraria ?? undefined,
      porcentajeAsistenciaMin: curso.porcentajeAsistenciaMin,
      notaAprobatoria: curso.notaAprobatoria,
      requiereNivelPrevio: curso.requiereNivelPrevio,
      cursoPrerequisitorId: curso.cursoPrerequisitorId ?? undefined,
    };
    this.formularioEnviado = false;
    this.errorGuardado.set(null);
    this.horariosPendientes.set([]);

    // cargamos los horarios reales del curso ya existente
    this.cursosService.horariosDelCurso(curso.id).subscribe(horarios => this.horariosGuardados.set(horarios));

    this.modalAbierto.set(true);
  }

  cerrarModal() {
    this.modalAbierto.set(false);
  }

  guardar() {
    this.formularioEnviado = true;
    this.errorGuardado.set(null);

    if (!this.form.nombre || !this.form.asignaturaId || !this.form.periodoId) return;
    if (this.form.edadMin != null && this.form.edadMax != null && this.form.edadMax < this.form.edadMin) {
      this.errorGuardado.set('La edad máxima debe ser mayor a la mínima.');
      return;
    }

    this.guardando.set(true);

    if (this.modoEdicion() && this.cursoEditando) {
      this.cursosService.actualizar(this.cursoEditando.id, this.form).subscribe({
        next: () => this.finalizarGuardado(),
        error: (err) => this.manejarErrorGuardado(err),
      });
    } else {
      // al crear, incluimos los horarios pendientes en el mismo payload
      // (igual que hace tu backend: si fallan, revierte el curso completo)
      const dto: CreateCursoDto = { ...this.form, horarios: this.horariosPendientes() };
      this.cursosService.crear(dto).subscribe({
        next: () => this.finalizarGuardado(),
        error: (err) => this.manejarErrorGuardado(err),
      });
    }
  }

  private finalizarGuardado() {
    this.guardando.set(false);
    this.cerrarModal();
    this.onFiltroChange();
  }

  private manejarErrorGuardado(err: any) {
    this.guardando.set(false);
    this.errorGuardado.set(err.error?.message ?? 'Error al guardar el curso');
  }

  //modal desactivar curso usando el componente confirm-popup
  desactivarModal(curso: Curso) {
      this.confirmPopup.set(true);
      this.curso.set(curso);
    }

  desactivar(estado: Boolean) {
    /*if (!confirm(`¿Desactivar el curso "${curso.nombre}"?`)) return;
    this.cursosService.desactivar(curso.id).subscribe({
      next: () => this.onFiltroChange(),
      error: (err) => alert(err.error?.message ?? 'Error al desactivar'),
    });*/
    if (!estado){
      this.confirmPopup.set(false);
      this.curso.set(null);
      return
    }
    const cursoId = this.curso()?.id;
    if (!cursoId) return;
     this.cursosService.desactivar(cursoId).subscribe({
      next: () => this.onFiltroChange(),
      error: (err) => alert(err.error?.message ?? 'Error al desactivar'),
    });
    this.confirmPopup.set(false);
    this.curso.set(null);
  }

  // ── Horarios: curso NUEVO (aún sin id, se acumulan localmente) ──
  agregarHorarioPendiente() {
    this.errorHorario.set(null);
    if (!this.nuevoHorario.horaInicio || !this.nuevoHorario.horaFin) {
      this.errorHorario.set('Completa hora de inicio y fin.');
      return;
    }
    if (this.nuevoHorario.horaFin <= this.nuevoHorario.horaInicio) {
      this.errorHorario.set('La hora de fin debe ser posterior a la de inicio.');
      return;
    }
    this.horariosPendientes.update(list => [...list, { ...this.nuevoHorario }]);
    this.nuevoHorario = { diaSemana: DiaSemana.LUNES, horaInicio: '', horaFin: '', aulaId: undefined };
  }

  quitarHorarioPendiente(index: number) {
    this.horariosPendientes.update(list => list.filter((_, i) => i !== index));
  }

  // ── Horarios: curso EXISTENTE (ya persistidos, van directo al backend) ──
  agregarHorarioGuardado() {
    if (!this.cursoEditando) return;
    this.errorHorario.set(null);
    if (!this.nuevoHorario.horaInicio || !this.nuevoHorario.horaFin) {
      this.errorHorario.set('Completa hora de inicio y fin.');
      return;
    }
    if (this.nuevoHorario.horaFin <= this.nuevoHorario.horaInicio) {
      this.errorHorario.set('La hora de fin debe ser posterior a la de inicio.');
      return;
    }

    this.cursosService.agregarHorarios(this.cursoEditando.id, [this.nuevoHorario]).subscribe({
      next: (nuevos) => {
        this.horariosGuardados.update(list => [...list, ...nuevos]);
        this.nuevoHorario = { diaSemana: DiaSemana.LUNES, horaInicio: '', horaFin: '', aulaId: undefined };
      },
      // el backend valida choque de aula vía trigger (P0001) o duplicado (23505) y lo traduce a mensaje claro
      error: (err) => this.errorHorario.set(err.error?.message ?? 'Error al agregar el horario'),
    });
  }

  eliminarHorarioGuardado(horario: Horario) {
    if (!confirm('¿Eliminar este horario?')) return;
    this.cursosService.eliminarHorario(horario.id).subscribe({
      next: () => this.horariosGuardados.update(list => list.filter(h => h.id !== horario.id)),
      error: (err) => alert(err.error?.message ?? 'Error al eliminar el horario'),
    });
  }

  nombreAula(aulaId: string | undefined | null): string {
    if (!aulaId) return '—';
    return this.aulasService.aulas().find(a => a.id === aulaId)?.nombre ?? '—';
  }
}