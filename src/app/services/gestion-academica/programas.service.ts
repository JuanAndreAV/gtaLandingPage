// src/app/services/academico/programas.service.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, tap, catchError, of, finalize } from 'rxjs';
import {
  Programa, CreateProgramaDto, UpdateProgramaDto,
  Periodo, CreatePeriodoDto, UpdatePeriodoDto,
} from '../../models/gestion-academica/programa';

@Injectable({ providedIn: 'root' })
export class ProgramasService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.baseUrl}/programas`;

  // ── Programas ─────────────────────────────────────────
  public programas = signal<Programa[]>([]);
  public isLoadingProgramas = signal(false);
  public errorProgramas = signal<string | null>(null);

  listarProgramas(): Observable<Programa[]> {
    this.isLoadingProgramas.set(true);
    this.errorProgramas.set(null);
    return this.http.get<Programa[]>(this.apiUrl).pipe(
      tap(data => this.programas.set(data)),
      catchError(err => {
        this.errorProgramas.set(err.error?.message ?? 'Error al cargar programas');
        return of([]);
      }),
      finalize(() => this.isLoadingProgramas.set(false))
    );
  }

  crearPrograma(dto: CreateProgramaDto): Observable<Programa> {
    return this.http.post<Programa>(this.apiUrl, dto);
  }

  actualizarPrograma(id: string, dto: UpdateProgramaDto): Observable<Programa> {
    return this.http.put<Programa>(`${this.apiUrl}/${id}`, dto);
  }

  desactivarPrograma(id: string): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.apiUrl}/${id}`);
  }

  // ── Periodos ──────────────────────────────────────────
  public periodos = signal<Periodo[]>([]);
  public isLoadingPeriodos = signal(false);
  public errorPeriodos = signal<string | null>(null);

  listarPeriodos(): Observable<Periodo[]> {
    this.isLoadingPeriodos.set(true);
    this.errorPeriodos.set(null);
    return this.http.get<Periodo[]>(`${this.apiUrl}/periodos`).pipe(
      tap(data => this.periodos.set(data)),
      catchError(err => {
        this.errorPeriodos.set(err.error?.message ?? 'Error al cargar periodos');
        return of([]);
      }),
      finalize(() => this.isLoadingPeriodos.set(false))
    );
  }

  periodoActivo(): Observable<Periodo | null> {
    return this.http.get<Periodo | null>(`${this.apiUrl}/periodos/activo`);
  }

  crearPeriodo(dto: CreatePeriodoDto): Observable<Periodo> {
    return this.http.post<Periodo>(`${this.apiUrl}/periodos`, dto);
  }

  actualizarPeriodo(id: string, dto: UpdatePeriodoDto): Observable<Periodo> {
    return this.http.put<Periodo>(`${this.apiUrl}/periodos/${id}`, dto);
  }

  desactivarPeriodo(id: string): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.apiUrl}/periodos/${id}`);
  }
}