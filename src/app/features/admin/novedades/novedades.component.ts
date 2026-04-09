import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { NovedadService } from '../../../services/novedad.service';
import { respuestaNovedad } from '../../../models/novedad';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-novedades',
  imports: [DatePipe],
  templateUrl: './novedades.component.html',
})
export class NovedadesComponent implements OnInit {

  novedadService = inject(NovedadService);

  // ── Estado local ────────────────────────────────────────────────
  filtroEstado   = signal<string>('todos');
  novedadActual  = signal<respuestaNovedad | null>(null);
  notaInput      = signal<string>('');
  guardando      = signal(false);
  mensajeExito   = signal<string | null>(null);

  // ── Lista filtrada (computed sobre el signal del servicio) ──────
  novedadesFiltradas = computed(() => {
    const estado = this.filtroEstado();
    const todas  = this.novedadService.updates();
    if (estado === 'todos') return todas;
    return todas.filter(n => n.estado === estado);
  });

  // ── Contadores ──────────────────────────────────────────────────
  totalPendientes = computed(() =>
    this.novedadService.updates().filter(n => n.estado === 'pendiente').length
  );
  totalAprobados = computed(() =>
    this.novedadService.updates().filter(n => n.estado === 'aprobado').length
  );
  totalRechazados = computed(() =>
    this.novedadService.updates().filter(n => n.estado === 'rechazado').length
  );

  ngOnInit() {
    this.novedadService.getAllUpdates().subscribe();
  }

  // ── Filtro ──────────────────────────────────────────────────────
  setFiltro(estado: string) {
    this.filtroEstado.set(estado);
  }

  // ── Modal ───────────────────────────────────────────────────────
  abrirModal(novedad: respuestaNovedad) {
    this.novedadActual.set(novedad);
    this.notaInput.set(novedad.notaCoordinador ?? '');
    this.mensajeExito.set(null);
  }

  cerrarModal() {
    this.novedadActual.set(null);
    this.notaInput.set('');
  }

  // ── Gestionar (aprobar / rechazar) ──────────────────────────────
  gestionar(estado: 'aprobado' | 'rechazado') {
    const novedad = this.novedadActual();
    if (!novedad) return;

    this.guardando.set(true);

    this.novedadService.updateNovedad(novedad._id, {
      notaCoordinador: this.notaInput() || undefined,
    }).subscribe({
      next: () => {
        // Actualiza el item en el signal local sin recargar todo
        this.novedadService.updates.update(lista =>
          lista.map(n => n._id === novedad._id
            ? { ...n, estado, notaCoordinador: this.notaInput() || undefined }
            : n
          )
        );
        this.mensajeExito.set(
          estado === 'aprobado' ? 'Novedad aprobada.' : 'Novedad rechazada.'
        );
        this.guardando.set(false);
        setTimeout(() => this.cerrarModal(), 1200);
      },
      error: () => {
        this.guardando.set(false);
      },
    });
  }
}