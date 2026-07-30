// src/app/services/academico/aulas.service.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Aulas as Aula, CreateAulaDto, UpdateAulaDto } from '../../models/gestion_academica/aulas';
import { Observable, tap, catchError, of, finalize } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AulasService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.baseUrl}/aulas`;

  public aulas = signal<Aula[]>([]);
  public isLoading = signal(false);
  public error = signal<string | null>(null);

  listar(): Observable<Aula[]> {
    this.isLoading.set(true);
    this.error.set(null);
    return this.http.get<Aula[]>(this.apiUrl).pipe(
      tap(data => this.aulas.set(data)),
      catchError(err => {
        this.error.set(err.error?.message ?? 'Error al cargar aulas');
        return of([]);
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  crear(dto: CreateAulaDto): Observable<Aula> {
    return this.http.post<Aula>(this.apiUrl, dto);
  }

  actualizar(id: string, dto: UpdateAulaDto): Observable<Aula> {
    return this.http.put<Aula>(`${this.apiUrl}/${id}`, dto);
  }

  desactivar(id: string): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.apiUrl}/${id}`);
  }
}