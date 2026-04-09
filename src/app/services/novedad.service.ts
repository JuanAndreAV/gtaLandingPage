import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Novedad, respuestaNovedad } from '../models/novedad';
import { catchError, finalize, Observable, tap, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NovedadService {

  private http    = inject(HttpClient);
  private apiUrl  = environment.culturaEventosApi;

  // ── Signals públicos ────────────────────────────────────────────
  isLoading = signal(false);
  error     = signal<string | null>(null);
  updates   = signal<respuestaNovedad[]>([]);
  mensaje   = signal('');

  // Paginación
  paginaActual  = signal(1);
  totalPaginas  = signal(1);
  readonly porPagina = 8;

  // ── GET todos (paginado en cliente) ─────────────────────────────
  getAllUpdates(): Observable<respuestaNovedad[]> {
    this.isLoading.set(true);
    this.error.set(null);
    this.updates.set([]);
    this.paginaActual.set(1);

    return this.http.get<respuestaNovedad[]>(`${this.apiUrl}/cambio-horario`).pipe(
      tap(data => {
        this.updates.set(data);
        this.totalPaginas.set(Math.ceil(data.length / this.porPagina));
      }),
      catchError(err => {
        this.error.set('Error al cargar las novedades.');
        return throwError(() => err);
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  // ── GET por estado ──────────────────────────────────────────────
  getByEstado(estado: string): Observable<respuestaNovedad[]> {
    this.isLoading.set(true);
    this.error.set(null);
    this.updates.set([]);
    this.paginaActual.set(1);

    return this.http.get<respuestaNovedad[]>(`${this.apiUrl}/cambio-horario/estado/${estado}`).pipe(
      tap(data => {
        this.updates.set(data);
        this.totalPaginas.set(Math.ceil(data.length / this.porPagina));
      }),
      catchError(err => {
        this.error.set('Error al cargar las novedades.');
        return throwError(() => err);
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  // ── PATCH ───────────────────────────────────────────────────────
  updateNovedad(id: string, payload: { estado: string; notaCoordinador?: string }): Observable<respuestaNovedad> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.patch<respuestaNovedad>(`${this.apiUrl}/cambio-horario/${id}`, payload).pipe(
      tap(() => this.mensaje.set('Novedad actualizada.')),
      catchError(err => {
        this.error.set('Error al actualizar la novedad.');
        return throwError(() => err);
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  // ── POST ────────────────────────────────────────────────────────
  reporteNovedad(novedad: Novedad): Observable<respuestaNovedad> {
    return this.http.post<respuestaNovedad>(`${this.apiUrl}/cambio-horario`, novedad);
  }
}