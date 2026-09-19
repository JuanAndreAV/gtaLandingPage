// src/app/services/gestion-academica/docentes.service.ts
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
    // Use a single explicit role string. The previous expression ('docente' || 'profesor' || undefined)
    // was always truthy and evaluated to 'docente'. Set the desired role explicitly.
    const rol = 'profesor';
    return this.http.get<{ datos: DocenteOption[] }>(this.apiUrl, {
      params: { rol:  rol, activo: 'true', porPagina: '200' },
    }).pipe(
      tap(res => this.docentes.set(res.datos ?? [])),
      catchError(() => { this.docentes.set([]); return of(null); }),
      finalize(() => this.isLoading.set(false)),
    );
  }
}