import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { NivelesService } from '../../../../services/gestion-academica/niveles.service';
import { AsignaturasService } from '../../../../services/gestion-academica/asignatura.service';
import { Asignatura } from '../../../../models/gestion-academica/asignatura';
import { Nivel } from '../../../../models/gestion-academica/oferta';

interface Borrador {
  id: string | null; // null = nuevo
  orden: number;
  nombre: string;
  descripcion: string;
}

@Component({
  selector: 'app-niveles',
  templateUrl: './niveles.component.html',
})
export class NivelesComponent implements OnInit {
  private nivelesService = inject(NivelesService);
  private asignaturasService = inject(AsignaturasService);

  asignaturas = signal<Asignatura[]>([]);
  niveles = signal<Nivel[]>([]);
  seleccionadaId = signal<string | null>(null);
  busqueda = signal('');
  cargando = signal(true);
  guardando = signal(false);
  cantidadGenerar = signal(4);
  borrador = signal<Borrador | null>(null);
  mensajeError = signal<string | null>(null);
  mensajeExito = signal<string | null>(null);

  readonly nivelesPorAsignatura = computed(() => {
    const mapa = new Map<string, Nivel[]>();
    for (const n of this.niveles()) {
      if (!mapa.has(n.asignaturaId)) mapa.set(n.asignaturaId, []);
      mapa.get(n.asignaturaId)!.push(n);
    }
    mapa.forEach((l) => l.sort((a, b) => a.orden - b.orden));
    return mapa;
  });

  readonly asignaturasFiltradas = computed(() => {
    const q = this.normalizar(this.busqueda().trim());
    return this.asignaturas()
      .filter((a) => a.activo && (!q || this.normalizar(a.nombre).includes(q)))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  });

  readonly seleccionada = computed(() => this.asignaturas().find((a) => a.id === this.seleccionadaId()) ?? null);
  readonly nivelesSeleccionada = computed(() => this.nivelesPorAsignatura().get(this.seleccionadaId() ?? '') ?? []);
  readonly sinNiveles = computed(() => this.asignaturasFiltradas().filter((a) => !this.nivelesPorAsignatura().has(a.id)).length);

  ngOnInit(): void {
    forkJoin({ asignaturas: this.asignaturasService.listar(), niveles: this.nivelesService.listar() }).subscribe({
      next: ({ asignaturas, niveles }) => {
        this.asignaturas.set(asignaturas);
        this.niveles.set(niveles);
        this.cargando.set(false);
      },
      error: (e) => { this.mensajeError.set(this.msg(e)); this.cargando.set(false); },
    });
  }

  seleccionar(id: string) {
    this.seleccionadaId.set(id);
    this.borrador.set(null);
    this.limpiarMensajes();
  }

  generar() {
    const id = this.seleccionadaId();
    const cantidad = this.cantidadGenerar();
    if (!id || cantidad < 1) return;
    this.guardando.set(true);
    this.limpiarMensajes();
    this.nivelesService.generar(id, cantidad).subscribe({
      next: (niveles) => {
        this.reemplazarNivelesDe(id, niveles);
        this.mensajeExito.set(`Niveles 1 a ${cantidad} listos para ${this.seleccionada()?.nombre}.`);
        this.guardando.set(false);
      },
      error: (e) => { this.mensajeError.set(this.msg(e)); this.guardando.set(false); },
    });
  }

  nuevo() {
    const siguiente = Math.max(0, ...this.nivelesSeleccionada().map((n) => n.orden)) + 1;
    this.borrador.set({ id: null, orden: siguiente, nombre: `Nivel ${siguiente}`, descripcion: '' });
  }

  editar(n: Nivel) {
    this.borrador.set({ id: n.id, orden: n.orden, nombre: n.nombre, descripcion: n.descripcion ?? '' });
  }

  actualizarBorrador(campo: keyof Borrador, valor: string) {
    this.borrador.update((b) => b && { ...b, [campo]: campo === 'orden' ? Number(valor) : valor });
  }

  guardar() {
    const b = this.borrador();
    const asignaturaId = this.seleccionadaId();
    if (!b || !asignaturaId) return;
    if (!b.nombre.trim() || !(b.orden >= 1)) {
      this.mensajeError.set('El nivel necesita un número (1 o mayor) y un nombre.');
      return;
    }
    this.guardando.set(true);
    this.limpiarMensajes();
    const datos = { orden: b.orden, nombre: b.nombre.trim(), descripcion: b.descripcion.trim() || undefined };
    const peticion = b.id ? this.nivelesService.actualizar(b.id, datos) : this.nivelesService.crear({ asignaturaId, ...datos });
    peticion.subscribe({
      next: (n) => {
        this.niveles.update((l) => [...l.filter((x) => x.id !== n.id), { ...l.find((x) => x.id === n.id), ...n }]);
        this.borrador.set(null);
        this.guardando.set(false);
      },
      error: (e) => { this.mensajeError.set(this.msg(e)); this.guardando.set(false); },
    });
  }

  alternarActivo(n: Nivel) {
    this.nivelesService.actualizar(n.id, { activo: !n.activo }).subscribe({
      next: (act) => this.niveles.update((l) => l.map((x) => (x.id === n.id ? { ...x, ...act } : x))),
      error: (e) => this.mensajeError.set(this.msg(e)),
    });
  }

  eliminar(n: Nivel) {
    if (!confirm(`¿Eliminar "${n.nombre}"?`)) return;
    this.limpiarMensajes();
    this.nivelesService.eliminar(n.id).subscribe({
      next: (r) => {
        this.niveles.update((l) => l.filter((x) => x.id !== n.id));
        this.mensajeExito.set(r.mensaje);
      },
      error: (e) => this.mensajeError.set(this.msg(e)),
    });
  }

  cantidadNiveles(asignaturaId: string): number {
    return this.nivelesPorAsignatura().get(asignaturaId)?.length ?? 0;
  }

  programas(a: Asignatura): string {
    return (a.pensum ?? []).map((p) => p.programa?.nombre).filter(Boolean).join(', ');
  }

  private reemplazarNivelesDe(asignaturaId: string, niveles: Nivel[]) {
    this.niveles.update((l) => {
      const cursos = new Map(l.map((n) => [n.id, n.cursos]));
      return [...l.filter((n) => n.asignaturaId !== asignaturaId), ...niveles.map((n) => ({ ...n, cursos: cursos.get(n.id) ?? 0 }))];
    });
  }

  private normalizar(s: string): string {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
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
