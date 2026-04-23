import { Component, inject, OnInit, signal, computed, input } from '@angular/core';
import { NovedadService } from '../../../services/novedad.service';
import { respuestaNovedad } from '../../../models/novedad';
import { DatePipe } from '@angular/common';

type Filtro = 'todos' | 'pendiente' | 'aprobado' | 'rechazado';

@Component({
  selector: 'app-novedades',
  imports: [DatePipe],
  templateUrl: './novedades.component.html',
})
export class NovedadesComponent implements OnInit {

  novedadService = inject(NovedadService);

  title = input<string>("Panel de novedades");
  subtitle = input<string>("Gestiona las solicitudes de los docentes");
  isAdmin = input<boolean>(true);

  filtroActivo  = signal<Filtro>('todos');
  novedadModal  = signal<respuestaNovedad | null>(null);
  notaInput     = signal('');
  guardando     = signal(false);
  mensajeModal  = signal<string | null>(null);

  readonly filtros: { val: Filtro; label: string }[] = [
    { val: 'todos',     label: 'Todas' },
    { val: 'pendiente', label: 'Pendientes' },
    { val: 'aprobado',  label: 'Aprobadas' },
    { val: 'rechazado', label: 'Rechazadas' },
  ];

  // ── Paginación ────────────────────────────────────────────────────
  paginaActual    = computed(() => this.novedadService.paginaActual());
  totalPaginas    = computed(() => this.novedadService.totalPaginas());

  novedadesPagina = computed(() => {
    const pagina = this.paginaActual();
    const por    = this.novedadService.porPagina;
    const inicio = (pagina - 1) * por;
    return this.novedadService.updates().slice(inicio, inicio + por);
  });

  // ── Contadores ────────────────────────────────────────────────────
  totalPendientes = computed(() =>
    this.novedadService.updates().filter(n => n.estado === 'pendiente').length);
  totalAprobados  = computed(() =>
    this.novedadService.updates().filter(n => n.estado === 'aprobado').length);
  totalRechazados = computed(() =>
    this.novedadService.updates().filter(n => n.estado === 'rechazado').length);

  // ── Páginas visibles ──────────────────────────────────────────────
  paginasVisibles = computed(() => {
    const total  = this.totalPaginas();
    const actual = this.paginaActual();
    const pages: (number | '...')[] = [];
    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (actual > 3) pages.push('...');
      for (let i = Math.max(2, actual - 1); i <= Math.min(total - 1, actual + 1); i++) pages.push(i);
      if (actual < total - 2) pages.push('...');
      pages.push(total);
    }
    return pages;
  });

  ngOnInit() { this.cargar('todos'); }

  // ── Filtro → backend ──────────────────────────────────────────────
  cargar(filtro: Filtro) {
    this.filtroActivo.set(filtro);
    const obs = filtro === 'todos'
      ? this.novedadService.getAllUpdates()
      : this.novedadService.getByEstado(filtro);
    obs.subscribe();
  }

  // ── Paginación ────────────────────────────────────────────────────
  irAPagina(p: number | '...') {
    if (typeof p === 'number') this.novedadService.paginaActual.set(p);
  }
  paginaAnterior() {
    if (this.paginaActual() > 1) this.novedadService.paginaActual.update(p => p - 1);
  }
  paginaSiguiente() {
    if (this.paginaActual() < this.totalPaginas()) this.novedadService.paginaActual.update(p => p + 1);
  }

  // ── Modal ─────────────────────────────────────────────────────────
  abrirModal(novedad: respuestaNovedad) {
    this.novedadModal.set(novedad);
    this.notaInput.set(novedad.notaCoordinador ?? '');
    this.mensajeModal.set(null);
  }
  cerrarModal() {
    this.novedadModal.set(null);
    this.mensajeModal.set(null);
  }

  // ── Gestionar ─────────────────────────────────────────────────────
  gestionar(estado: 'aprobado' | 'rechazado') {
    const novedad = this.novedadModal();
    if (!novedad) return;
    this.guardando.set(true);

    this.novedadService.updateNovedad(novedad._id, {
      estado,
      notaCoordinador: this.notaInput().trim() || undefined,
    }).subscribe({
      next: (actualizada) => {
        this.novedadService.updates.update(lista =>
          lista.map(n => n._id === actualizada._id ? actualizada : n)
        );
        this.mensajeModal.set(estado === 'aprobado' ? '✓ Aprobada.' : '✓ Rechazada.');
        this.guardando.set(false);
        setTimeout(() => this.cerrarModal(), 1000);
      },
      error: () => {
        this.mensajeModal.set('Error al actualizar. Intenta de nuevo.');
        this.guardando.set(false);
      },
    });
  }
}