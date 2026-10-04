// src/app/services/academico/inscripciones.service.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, tap, catchError, of, finalize } from 'rxjs';
import { Inscripcion, CreateInscripcionDto, CambiarEstadoDto } from '../../models/gestion-academica/inscripcion';

@Injectable({ providedIn: 'root' })
export class InscripcionesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.baseUrl}/inscripciones`;

  public pendientes = signal<Inscripcion[]>([]);
  public porCurso = signal<Inscripcion[]>([]);
  public isLoading = signal(false);
  public error = signal<string | null>(null);

  listarPendientes(): Observable<Inscripcion[]> {
    this.isLoading.set(true);
    this.error.set(null);
    return this.http.get<Inscripcion[]>(`${this.apiUrl}/pendientes`).pipe(
      tap(data => this.pendientes.set(data)),
      catchError(err => {
        this.error.set(err.error?.message ?? 'Error al cargar inscripciones pendientes');
        return of([]);
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  listarPorCurso(cursoId: string): Observable<Inscripcion[]> {
    this.isLoading.set(true);
    this.error.set(null);
    return this.http.get<Inscripcion[]>(`${this.apiUrl}/curso/${cursoId}`).pipe(
      tap(data => this.porCurso.set(data)),
      catchError(err => {
        this.error.set(err.error?.message ?? 'Error al cargar inscripciones del curso');
        return of([]);
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  // soloActivas=true filtra por estado ACTIVA/PENDIENTE en el backend
  listarPorEstudiante(usuarioId: string, soloActivas = false): Observable<Inscripcion[]> {
    const params = soloActivas ? '?soloActivas=true' : '';
    return this.http.get<Inscripcion[]>(`${this.apiUrl}/estudiante/${usuarioId}${params}`);
  }

  inscribirDirecto(dto: CreateInscripcionDto): Observable<Inscripcion> {
    return this.http.post<Inscripcion>(this.apiUrl, dto);
  }

  preInscribir(dto: CreateInscripcionDto): Observable<Inscripcion> {
    return this.http.post<Inscripcion>(`${this.apiUrl}/pre-inscribir`, dto);
  }

  aprobar(id: string): Observable<Inscripcion> {
    return this.http.patch<Inscripcion>(`${this.apiUrl}/${id}/aprobar`, {});
  }

  cambiarEstado(id: string, dto: CambiarEstadoDto): Observable<Inscripcion> {
    return this.http.patch<Inscripcion>(`${this.apiUrl}/${id}/estado`, dto);
  }
  eliminar(id: string): Observable<Inscripcion> {
    return this.http.delete<Inscripcion>(`${this.apiUrl}/${id}`)
  }
}