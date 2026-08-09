// src/app/services/academico/asignaturas.service.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, tap, catchError, of, finalize } from 'rxjs';
import { Asignatura, CreateAsignaturaDto, UpdateAsignaturaDto, PensumItem, PensumItemDto } from '../../models/gestion-academica/asignatura';

@Injectable({ providedIn: 'root' })
export class AsignaturasService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.baseUrl}/asignaturas`;

  public asignaturas = signal<Asignatura[]>([]);
  public isLoading = signal(false);
  public error = signal<string | null>(null);

  listar(programaId?: string): Observable<Asignatura[]> {
    this.isLoading.set(true);
    this.error.set(null);
    const params = programaId ? { programaId } : {programaId: ''}; // Ensure programaId is always a string, even if undefined

    return this.http.get<Asignatura[]>(`${this.apiUrl}?${new URLSearchParams(params)}`).pipe(
      tap(data => this.asignaturas.set(data)),
      catchError(err => {
        this.error.set(err.error?.message ?? 'Error al cargar asignaturas');
        return of([]);
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  ver(id: string): Observable<Asignatura> {
    return this.http.get<Asignatura>(`${this.apiUrl}/${id}`);
  }

  crear(dto: CreateAsignaturaDto): Observable<Asignatura> {
    return this.http.post<Asignatura>(this.apiUrl, dto);
  }

  actualizar(id: string, dto: UpdateAsignaturaDto): Observable<Asignatura> {
    return this.http.put<Asignatura>(`${this.apiUrl}/${id}`, dto);
  }

  desactivar(id: string): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.apiUrl}/${id}`);
  }

  // ── Pensum ──────────────────────────────────────────────
  programasDeAsignatura(asignaturaId: string): Observable<PensumItem[]> {
    return this.http.get<PensumItem[]>(`${this.apiUrl}/${asignaturaId}/programas`);
  }

  asociarProgramas(asignaturaId: string, programas: PensumItemDto[]): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.apiUrl}/${asignaturaId}/programas`, programas);
  }

  actualizarPensum(asignaturaId: string, programaId: string, datos: { obligatoria?: boolean; orden?: number }): Observable<PensumItem> {
    return this.http.patch<PensumItem>(`${this.apiUrl}/${asignaturaId}/programas/${programaId}`, datos);
  }

  desasociarPrograma(asignaturaId: string, programaId: string): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.apiUrl}/${asignaturaId}/programas/${programaId}`);
  }
}