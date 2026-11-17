import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CursosDocenteService } from '../../../services/gestion-academica/cursos-docente.service';

@Component({
  selector: 'app-mi-horario',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mi-horario.component.html',
})
export class MiHorarioComponent implements OnInit {
  private cursosService = inject(CursosDocenteService);

  cursos    = signal<any[]>([]);
  isLoading = signal(true);
  error     = signal<string | null>(null);

  readonly dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
  readonly hoy  = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'][new Date().getDay()];

  semana = computed(() =>
    this.dias
      .map(dia => ({
        dia,
        sesiones: this.cursos()
          .flatMap(c => (c.horarios ?? [])
            .filter((h: any) => h.diaSemana === dia)
            .map((h: any) => ({ curso: c, h })))
          .sort((a, b) => a.h.horaInicio.localeCompare(b.h.horaInicio)),
      }))
      .filter(d => d.sesiones.length),
  );

  // Cursos sin horario cargado: igual deben poder pasar lista
  sinHorario = computed(() => this.cursos().filter(c => !(c.horarios ?? []).length));

  ngOnInit() {
    this.cursosService.misCursos().subscribe({
      next: c => { this.cursos.set(c); this.isLoading.set(false); },
      error: e => {
        this.error.set(e.error?.message ?? 'No se pudo cargar tu horario');
        this.isLoading.set(false);
      },
    });
  }

  dia(d: string) { return d.charAt(0).toUpperCase() + d.slice(1); }
}