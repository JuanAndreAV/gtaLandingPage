// src/app/services/ubicacion.service.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

export interface Departamento {
  id: number;
  name: string;
}

export interface Municipio {
  id: number;
  name: string;
  departmentId: number;
}

@Injectable({ providedIn: 'root' })
export class UbicacionService {
  private http = inject(HttpClient);
  private baseUrl = 'https://api-colombia.com/api/v1';

  departamentos = signal<Departamento[]>([]);
  municipios    = signal<Municipio[]>([]);
  cargandoDeps  = signal(false);
  cargandoMuns  = signal(false);

  getDepartamentos(): Observable<Departamento[]> {
    this.cargandoDeps.set(true);
    return this.http.get<Departamento[]>(`${this.baseUrl}/Department`).pipe(
      tap(data => {
        this.departamentos.set(
          data.sort((a, b) => a.name.localeCompare(b.name))
        );
        this.cargandoDeps.set(false);
      })
    );
  }

  getMunicipios(departamentoId: number): Observable<Municipio[]> {
    this.cargandoMuns.set(true);
    this.municipios.set([]); // limpiar al cambiar departamento
    return this.http.get<Municipio[]>(
      `${this.baseUrl}/Department/${departamentoId}/cities`
    ).pipe(
      tap(data => {
        this.municipios.set(
          data.sort((a, b) => a.name.localeCompare(b.name))
        );
        this.cargandoMuns.set(false);
      })
    );
  }
}