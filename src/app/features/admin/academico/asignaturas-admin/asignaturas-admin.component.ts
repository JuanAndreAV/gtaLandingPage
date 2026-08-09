// asignaturas-admin.component.ts
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsignaturasService } from '../../../../services/gestion-academica/asignatura.service';
import { ProgramasService } from '../../../../services/gestion-academica/programas.service';
import { DocentesService } from '../../../../services/gestion-academica/docentes.service';
import { Asignatura, CreateAsignaturaDto, PensumItem } from '../../../../models/gestion-academica/asignatura';
import { Programa } from '../../../../models/gestion-academica/programa';

interface PensumEdicion {
  programaId: string;
  nombre: string;
  colorHex: string | null;
  seleccionado: boolean;
  obligatoria: boolean;
  orden: number | null;
  yaExistia: boolean; // para saber si hay que crear, actualizar o desasociar
}

@Component({
  selector: 'app-asignaturas-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asignaturas-admin.component.html',
})
export class AsignaturasAdminComponent implements OnInit {
  asignaturasService = inject(AsignaturasService);
  programasService = inject(ProgramasService);
  docentesService = inject(DocentesService);

  filtroPrograma = signal<string>('');

  // ── Modal CRUD básico ──────────────────────────────────
  modalAbierto = signal(false);
  modoEdicion = signal(false);
  guardando = signal(false);
  formularioEnviado = false;
  asignaturaEditando: Asignatura | null = null;
  form: CreateAsignaturaDto = { nombre: '', descripcion: '', docenteId: undefined };

  // ── Modal de pensum ────────────────────────────────────
  modalPensumAbierto = signal(false);
  guardandoPensum = signal(false);
  asignaturaPensum: Asignatura | null = null;
  filasPensum = signal<PensumEdicion[]>([]);

  ngOnInit() {
    this.asignaturasService.listar().subscribe();
    this.programasService.listarProgramas().subscribe();
    this.docentesService.listar().subscribe();
  }

  onFiltroChange() {
    this.asignaturasService.listar(this.filtroPrograma() || undefined).subscribe();
  }

  // ── CRUD básico ────────────────────────────────────────
  abrirModalNueva() {
    this.modoEdicion.set(false);
    this.asignaturaEditando = null;
    this.form = { nombre: '', descripcion: '', docenteId: undefined };
    this.formularioEnviado = false;
    this.modalAbierto.set(true);
  }

  editar(asignatura: Asignatura) {
    this.modoEdicion.set(true);
    this.asignaturaEditando = asignatura;
    this.form = {
      nombre: asignatura.nombre,
      descripcion: asignatura.descripcion ?? '',
      docenteId: asignatura.docenteId ?? undefined,
    };
    this.formularioEnviado = false;
    this.modalAbierto.set(true);
  }

  cerrarModal() {
    this.modalAbierto.set(false);
  }

  guardar() {
    this.formularioEnviado = true;
    if (!this.form.nombre) return;

    this.guardando.set(true);
    const obs = this.modoEdicion() && this.asignaturaEditando
      ? this.asignaturasService.actualizar(this.asignaturaEditando.id, this.form)
      : this.asignaturasService.crear(this.form);

    obs.subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarModal();
        this.asignaturasService.listar(this.filtroPrograma() || undefined).subscribe();
      },
      error: (err) => {
        this.guardando.set(false);
        alert(err.error?.message ?? 'Error al guardar la asignatura');
      },
    });
  }

  desactivar(asignatura: Asignatura) {
    if (!confirm(`¿Desactivar la asignatura "${asignatura.nombre}"?`)) return;
    this.asignaturasService.desactivar(asignatura.id).subscribe({
      next: () => this.asignaturasService.listar(this.filtroPrograma() || undefined).subscribe(),
      error: (err) => alert(err.error?.message ?? 'Error al desactivar'),
    });
  }

  // ── Gestión de pensum ──────────────────────────────────
  abrirPensum(asignatura: Asignatura) {
    this.asignaturaPensum = asignatura;
    this.guardandoPensum.set(false);

    this.asignaturasService.programasDeAsignatura(asignatura.id).subscribe(actuales => {
      const mapaActuales = new Map(actuales.map(p => [p.programaId, p]));

      const filas: PensumEdicion[] = this.programasService.programas().map(prog => {
        const actual = mapaActuales.get(prog.id);
        return {
          programaId: prog.id,
          nombre: prog.nombre,
          colorHex: prog.colorHex,
          seleccionado: !!actual,
          obligatoria: actual?.obligatoria ?? true,
          orden: actual?.orden ?? null,
          yaExistia: !!actual,
        };
      });

      this.filasPensum.set(filas);
      this.modalPensumAbierto.set(true);
    });
  }

  cerrarPensum() {
    this.modalPensumAbierto.set(false);
    this.asignaturaPensum = null;
  }

  toggleFila(fila: PensumEdicion) {
    fila.seleccionado = !fila.seleccionado;
    this.filasPensum.set([...this.filasPensum()]);
  }

  guardarPensum() {
    if (!this.asignaturaPensum) return;
    const asignaturaId = this.asignaturaPensum.id;
    const filas = this.filasPensum();

    const aAsociar = filas.filter(f => f.seleccionado && !f.yaExistia);
    const aActualizar = filas.filter(f => f.seleccionado && f.yaExistia);
    const aDesasociar = filas.filter(f => !f.seleccionado && f.yaExistia);

    this.guardandoPensum.set(true);

    const tareas: Promise<any>[] = [];

    if (aAsociar.length) {
      tareas.push(
        this.asignaturasService.asociarProgramas(
          asignaturaId,
          aAsociar.map(f => ({ programaId: f.programaId, obligatoria: f.obligatoria, orden: f.orden ?? undefined }))
        ).toPromise()
      );
    }

    for (const f of aActualizar) {
      tareas.push(
        this.asignaturasService.actualizarPensum(asignaturaId, f.programaId, {
          obligatoria: f.obligatoria,
          orden: f.orden ?? undefined,
        }).toPromise()
      );
    }

    for (const f of aDesasociar) {
      tareas.push(this.asignaturasService.desasociarPrograma(asignaturaId, f.programaId).toPromise());
    }

    Promise.all(tareas)
      .then(() => {
        this.guardandoPensum.set(false);
        this.cerrarPensum();
        this.asignaturasService.listar(this.filtroPrograma() || undefined).subscribe();
      })
      .catch((err) => {
        this.guardandoPensum.set(false);
        alert(err.error?.message ?? 'Error al guardar el pensum');
      });
  }
}