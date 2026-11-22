// asignaturas-admin.component.ts
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsignaturasService } from '../../../../services/gestion-academica/asignatura.service';
import { ProgramasService } from '../../../../services/gestion-academica/programas.service';
import { DocentesService } from '../../../../services/gestion-academica/docentes.service';
import { Asignatura, CreateAsignaturaDto, PensumItem } from '../../../../models/gestion-academica/asignatura';
import { RouterLink } from '@angular/router';
import { NivelesService } from '../../../../services/gestion-academica/niveles.service';
import { AdminPageHeaderComponent } from '../../../../shared/components/admin/page-header/admin-page-header.component';
import { AdminModalComponent } from '../../../../shared/components/admin/modal/admin-modal.component';
import { ConfirmPopupComponent } from '../../../shared/components/confirm-popup/confirm-popup.component';

interface PensumEdicion {
  programaId: string;
  nombre: string;
  colorHex: string | null;
  seleccionado: boolean;
  obligatoria: boolean;
  orden: number | null;
  yaExistia: boolean; // para saber si hay que crear, actualizar o desasociar
}
// averiguar el orden del pensum y la obligatoriedad, revisar en base de datos perfil docente.

@Component({
  selector: 'app-asignaturas-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AdminPageHeaderComponent, AdminModalComponent, ConfirmPopupComponent],
  templateUrl: './asignaturas-admin.component.html',
})
export class AsignaturasAdminComponent implements OnInit {
  asignaturasService = inject(AsignaturasService);
  programasService = inject(ProgramasService);
  docentesService = inject(DocentesService);
  private nivelesService = inject(NivelesService);

  filtroPrograma = signal<string>('');
  busqueda = signal('');
  errorGuardado = signal<string | null>(null);
  errorPensum = signal<string | null>(null);
  porDesactivar = signal<Asignatura | null>(null);
  nivelesPorAsignatura = signal<Map<string, number>>(new Map());

  readonly filtradas = computed(() => {
    const q = this.normalizar(this.busqueda().trim());
    const lista = this.asignaturasService.asignaturas();
    return q ? lista.filter((a) => this.normalizar(`${a.nombre} ${a.descripcion ?? ''}`).includes(q)) : lista;
  });

  readonly seleccionadasPensum = computed(() => this.filasPensum().filter((f) => f.seleccionado).length);

  // ── Modal CRUD básico ──────────────────────────────────
  modalAbierto = signal(false);
  modoEdicion = signal(false);
  guardando = signal(false);
  formularioEnviado = false;
  asignaturaEditando: Asignatura | null = null;
  form: CreateAsignaturaDto = { nombre: '', descripcion: '' };

  // ── Modal de pensum ────────────────────────────────────
  modalPensumAbierto = signal(false);
  guardandoPensum = signal(false);
  asignaturaPensum: Asignatura | null = null;
  filasPensum = signal<PensumEdicion[]>([]);

  ngOnInit() {
    this.asignaturasService.listar().subscribe();
    this.programasService.listarProgramas().subscribe();
    this.docentesService.listar().subscribe();
    this.nivelesService.listar().subscribe({
      next: (niveles) => {
        const m = new Map<string, number>();
        for (const n of niveles) if (n.activo) m.set(n.asignaturaId, (m.get(n.asignaturaId) ?? 0) + 1);
        this.nivelesPorAsignatura.set(m);
      },
      error: () => {}, // la cantidad de niveles es informativa
    });
  }

  onFiltroChange() {
    this.asignaturasService.listar(this.filtroPrograma() || undefined).subscribe();
  }

  // ── CRUD básico ────────────────────────────────────────
  abrirModalNueva() {
    this.modoEdicion.set(false);
    this.asignaturaEditando = null;
    this.form = { nombre: '', descripcion: '' };
    this.formularioEnviado = false;
    this.errorGuardado.set(null);
    this.modalAbierto.set(true);
  }

  editar(asignatura: Asignatura) {
    this.modoEdicion.set(true);
    this.asignaturaEditando = asignatura;
    this.form = {
      nombre: asignatura.nombre,
      descripcion: asignatura.descripcion ?? '',
    };
    this.formularioEnviado = false;
    this.errorGuardado.set(null);
    this.modalAbierto.set(true);
  }

  cerrarModal() {
    this.modalAbierto.set(false);
  }

  guardar() {
    this.formularioEnviado = true;
    if (!this.form.nombre?.trim()) return;
    this.errorGuardado.set(null);

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
        this.errorGuardado.set(this.mensaje(err, 'No se pudo guardar la asignatura'));
      },
    });
  }

  desactivar(asignatura: Asignatura) {
    this.porDesactivar.set(asignatura);
  }

  confirmarDesactivar(confirmado: boolean) {
    const asignatura = this.porDesactivar();
    this.porDesactivar.set(null);
    if (!confirmado || !asignatura) return;
    this.asignaturasService.desactivar(asignatura.id).subscribe({
      next: () => this.asignaturasService.listar(this.filtroPrograma() || undefined).subscribe(),
      error: (err) => this.asignaturasService.error.set(this.mensaje(err, 'No se pudo desactivar')),
    });
  }

  cantidadNiveles(id: string): number {
    return this.nivelesPorAsignatura().get(id) ?? 0;
  }

  private normalizar(s: string): string {
    return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  private mensaje(err: any, defecto: string): string {
    const m = err?.error?.message;
    return Array.isArray(m) ? m.join('. ') : (m ?? defecto);
  }

  // ── Gestión de pensum ──────────────────────────────────
  abrirPensum(asignatura: Asignatura) {
    this.asignaturaPensum = asignatura;
    this.guardandoPensum.set(false);
    this.errorPensum.set(null);

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
        this.errorPensum.set(this.mensaje(err, 'No se pudo guardar el pensum'));
      });
  }
}