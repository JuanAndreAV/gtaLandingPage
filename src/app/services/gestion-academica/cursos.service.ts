// src/app/services/academico/cursos.service.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, tap, catchError, of, finalize } from 'rxjs';
import { Curso, CreateCursoDto, UpdateCursoDto, Horario, CreateHorarioDto } from '../../models/gestion-academica/curso';

@Injectable({ providedIn: 'root' })
export class CursosService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.baseUrl}/cursos`;

  public cursos = signal<Curso[]>([]);
  public isLoading = signal(false);
  public error = signal<string | null>(null);

  listar(filtros?: { periodoId?: string; asignaturaId?: string; docenteId?: string | null}): Observable<Curso[]> {
    this.isLoading.set(true);
    this.error.set(null);
    const params: Record<string, string> = {};
    if (filtros?.periodoId) params['periodoId'] = filtros.periodoId;
    if (filtros?.asignaturaId) params['asignaturaId'] = filtros.asignaturaId;
    if (filtros?.docenteId) params['docenteId'] = filtros.docenteId;

    return this.http.get<Curso[]>(this.apiUrl, { params }).pipe(
      tap(data => this.cursos.set(data)),
      catchError(err => {
        this.error.set(err.error?.message ?? 'Error al cargar cursos');
        return of([]);
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  ver(id: string): Observable<Curso> {
    return this.http.get<Curso>(`${this.apiUrl}/${id}`);
  }

  crear(dto: CreateCursoDto): Observable<Curso> {
    return this.http.post<Curso>(this.apiUrl, dto);
  }

  actualizar(id: string, dto: UpdateCursoDto): Observable<Curso> {
    return this.http.put<Curso>(`${this.apiUrl}/${id}`, dto);
  }

  desactivar(id: string): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.apiUrl}/${id}`);
  }

  // ── Horarios ────────────────────────────────────────────
  agregarHorarios(cursoId: string, horarios: CreateHorarioDto[]): Observable<Horario[]> {
    return this.http.post<Horario[]>(`${this.apiUrl}/${cursoId}/horarios`, horarios);
  }

  horariosDelCurso(cursoId: string): Observable<Horario[]> {
    return this.http.get<Horario[]>(`${this.apiUrl}/${cursoId}/horarios`);
  }

  eliminarHorario(horarioId: string): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.apiUrl}/horarios/${horarioId}`);
  }
}