// src/app/services/academico/docentes.service.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { tap, catchError, of, finalize } from 'rxjs';

export interface DocenteOption {
  id: string;
  nombre_completo: string;
}

@Injectable({ providedIn: 'root' })
export class DocentesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.baseUrl}/usuarios`;

  public docentes = signal<DocenteOption[]>([]);
  public isLoading = signal(false);

  listar() {
    this.isLoading.set(true);
    return this.http.get<{ datos: DocenteOption[] }>(this.apiUrl, {
      params: { rol: 'docente', activo: 'true', porPagina: '200' },
    }).pipe(
      tap(res => this.docentes.set(res.datos ?? [])),
      catchError(() => { this.docentes.set([]); return of(null); }),
      finalize(() => this.isLoading.set(false)),
    );
  }
}