import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../auth/services/auth.service'; // ajusta la ruta
import { InscripcionesService } from '../../../../services/gestion-academica/inscripciones.service';
import { EstadoInscripcion } from '../../../../models/gestion-academica/inscripcion';

type Estado = 'pendiente' | 'activa' | 'retirada' | 'suspendida' | 'finalizada';

interface InscripcionDetalle {
  id: string;
  estado: Estado;
  observaciones: string | null;
  createdAt: string;
  usuario: {
    id: string; nombre: string | null; apellido: string | null;
    documento: string | null; telefono: string | null;
    email: string; emailFicticio: boolean;
  };
}

@Component({
  selector: 'app-curso-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './curso-detalle.component.html',
})
export class CursoDetalleComponent implements OnInit {
  private http  = inject(HttpClient);
  private route = inject(ActivatedRoute);
  inscripcionesService = inject(InscripcionesService);
  isAdmin       = inject(AuthService).isAdmin;

  private base = environment.baseUrl;
  private cursoId = '';

  curso     = signal<any>(null);
  inscritos = signal<InscripcionDetalle[]>([]);
  isLoading = signal(true);
  procesando = signal<string | null>(null);   // id de la inscripción en proceso
  errorMsg  = signal<string | null>(null);
  filtro    = signal<EstadoInscripcion | 'todas'>('todas');

  readonly estados: EstadoInscripcion[] = Object.values(EstadoInscripcion)

  activas = computed(() => this.inscritos().filter(i => i.estado === 'activa').length);
  cuposLibres = computed(() => (this.curso()?.capacidadMax ?? 0) - this.activas());
  inscritosFiltrados = computed(() =>
    this.filtro() === 'todas'
      ? this.inscritos()
      : this.inscritos().filter(i => i.estado === this.filtro())
  );

  contar(estado: EstadoInscripcion) {
    return this.inscritos().filter(i => i.estado === estado).length;
  }

  ngOnInit() {
    this.cursoId = this.route.snapshot.paramMap.get('id')!;
    this.cargar();
  }

  cargar() {
    this.isLoading.set(true);
    this.http.get(`${this.base}/cursos/${this.cursoId}`).subscribe({
      next: c => this.curso.set(c),
      error: e => this.errorMsg.set(e.error?.message ?? 'No se pudo cargar el curso'),
    });
    this.http.get<InscripcionDetalle[]>(`${this.base}/inscripciones/curso/${this.cursoId}`).subscribe({
      next: l => { this.inscritos.set(l); this.isLoading.set(false); },
      error: e => { this.errorMsg.set(e.error?.message ?? 'No se pudieron cargar los inscritos'); this.isLoading.set(false); },
    });
  }

  aprobar(i: InscripcionDetalle) {
    this.ejecutar(i, this.inscripcionesService.aprobar(i.id));
  }

  cambiarEstado(i: InscripcionDetalle, estado: EstadoInscripcion) {
    if (estado === i.estado) return;
    if (!confirm(`¿Cambiar a "${estado}" la inscripción de ${i.usuario.nombre} ${i.usuario.apellido}?`)) {
      this.cargar(); // restaura el select
      return;
    }
    //this.ejecutar(i, this.http.patch<any>(`${this.base}/inscripciones/${i.id}/estado`, { estado }));
    this.ejecutar(i, this.inscripcionesService.cambiarEstado(i.id,{estado}))
  }

  eliminar(i: InscripcionDetalle) {
    if (!confirm(`¿Eliminar la inscripción de ${i.usuario.nombre} ${i.usuario.apellido}? No se puede deshacer.`)) return;
    this.procesando.set(i.id);
    this.errorMsg.set(null);
    this.inscripcionesService.eliminar(i.id).subscribe({
      next: () => { this.inscritos.update(l => l.filter(x => x.id !== i.id)); this.procesando.set(null); },
      error: e => { this.errorMsg.set(e.error?.message ?? 'No se pudo eliminar'); this.procesando.set(null); },
    });
  }

  // El PATCH devuelve la inscripción SIN la relación usuario,
  // por eso solo se actualiza el estado en lugar de reemplazar el objeto.
  private ejecutar(i: InscripcionDetalle, req$: any) {
    this.procesando.set(i.id);
    this.errorMsg.set(null);
    req$.subscribe({
      next: (res: any) => {
        this.inscritos.update(l => l.map(x => x.id === i.id ? { ...x, estado: res.estado } : x));
        this.procesando.set(null);
      },
      error: (e: any) => { this.errorMsg.set(e.error?.message ?? 'No se pudo actualizar'); this.procesando.set(null); },
    });
  }

  badge(estado: Estado) {
    return {
      pendiente:  'bg-amber-100 text-amber-700',
      activa:     'bg-green-100 text-green-700',
      suspendida: 'bg-orange-100 text-orange-700',
      retirada:   'bg-gray-100 text-gray-600',
      finalizada: 'bg-blue-100 text-blue-700',
    }[estado];
  }
}