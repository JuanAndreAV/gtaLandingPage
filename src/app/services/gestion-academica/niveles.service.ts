import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Nivel } from '../../models/gestion-academica/oferta';

@Injectable({ providedIn: 'root' })
export class NivelesService {
  private http = inject(HttpClient);
  private base = `${environment.baseUrl}/niveles`;

  listar(asignaturaId?: string): Observable<Nivel[]> {
    const params = asignaturaId ? new HttpParams().set('asignaturaId', asignaturaId) : undefined;
    return this.http.get<Nivel[]>(this.base, { params });
  }

  crear(datos: { asignaturaId: string; orden: number; nombre: string; descripcion?: string }): Observable<Nivel> {
    return this.http.post<Nivel>(this.base, datos);
  }

  generar(asignaturaId: string, cantidad: number): Observable<Nivel[]> {
    return this.http.post<Nivel[]>(`${this.base}/generar`, { asignaturaId, cantidad });
  }

  actualizar(id: string, datos: Partial<Pick<Nivel, 'orden' | 'nombre' | 'descripcion' | 'activo'>>): Observable<Nivel> {
    return this.http.patch<Nivel>(`${this.base}/${id}`, datos);
  }

  eliminar(id: string) {
    return this.http.delete<{ mensaje: string }>(`${this.base}/${id}`);
  }
}
