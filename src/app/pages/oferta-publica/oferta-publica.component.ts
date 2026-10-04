import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import { environment } from '../../../environments/environment';

interface OfertaCurso {
  id: string; nombre: string; descripcion: string | null; asignatura: string;
  programas: string[]; areas: string[]; periodo: string;
  docente: { nombre: string | null; apellido: string | null; fotoUrl: string | null } | null;
  capacidadMax: number; inscritos: number; cuposDisponibles: number;
  edadMin: number | null; edadMax: number | null;
  horarios: { diaSemana: string; horaInicio: string; horaFin: string; aula: string | null }[];
}

@Component({
  selector: 'app-oferta-publica',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './oferta-publica.component.html',
})
export class OfertaPublicaComponent implements OnInit {
  private http = inject(HttpClient);

  cursos    = signal<OfertaCurso[]>([]);
  isLoading = signal(true);
  error     = signal<string | null>(null);

  filtroTexto = new FormControl('');
  filtroArea  = new FormControl('');
  filtroEdad  = new FormControl<number | null>(null);

  private texto = toSignal(this.filtroTexto.valueChanges.pipe(startWith('')), { initialValue: '' });
  private area  = toSignal(this.filtroArea.valueChanges.pipe(startWith('')),  { initialValue: '' });
  private edad  = toSignal(this.filtroEdad.valueChanges.pipe(startWith(null)), { initialValue: null });

  areas = computed(() => [...new Set(this.cursos().flatMap(c => c.areas))].sort());

  filtrados = computed(() => {
    const t = (this.texto() ?? '').toLowerCase();
    const a = this.area();
    const e = this.edad();
    return this.cursos().filter(c =>
      (!a || c.areas.includes(a)) &&
      (e == null || ((c.edadMin == null || e >= c.edadMin) && (c.edadMax == null || e <= c.edadMax))) &&
      (!t || c.nombre.toLowerCase().includes(t) || c.asignatura.toLowerCase().includes(t) ||
             `${c.docente?.nombre} ${c.docente?.apellido}`.toLowerCase().includes(t))
    );
  });

  ngOnInit() {
    this.http.get<OfertaCurso[]>(`${environment.baseUrl}/publico/oferta`).subscribe({
      next: d => { this.cursos.set(d); this.isLoading.set(false); },
      error: () => { this.error.set('No pudimos cargar la oferta. Intenta más tarde.'); this.isLoading.set(false); },
    });
  }

  edadLabel(c: OfertaCurso) {
    if (c.edadMin != null && c.edadMax != null) return `${c.edadMin} a ${c.edadMax} años`;
    if (c.edadMin != null) return `Desde ${c.edadMin} años`;
    if (c.edadMax != null) return `Hasta ${c.edadMax} años`;
    return 'Todas las edades';
  }

  dia(d: string) { return d.charAt(0).toUpperCase() + d.slice(1); }

  anchoBarra(c: OfertaCurso) {
    return Math.min((c.inscritos / c.capacidadMax) * 100, 100);
  }
}