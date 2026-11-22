import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CursoOfertaDatos, EstadoOferta, OfertaCurso, PrevisualizacionOferta,
} from '../../models/gestion-academica/oferta';

@Injectable({ providedIn: 'root' })
export class OfertasService {
  private http = inject(HttpClient);
  private base = `${environment.baseUrl}/ofertas`;

  // ── Docente ──
  descargarPlantilla(): Observable<Blob> {
    return this.http.get(`${this.base}/plantilla`, { responseType: 'blob' });
  }

  previsualizar(archivo: File): Observable<PrevisualizacionOferta> {
    const datos = new FormData();
    datos.append('archivo', archivo);
    return this.http.post<PrevisualizacionOferta>(`${this.base}/previsualizar`, datos);
  }

  enviar(periodoId: string, cursos: CursoOfertaDatos[], archivoNombre?: string) {
    return this.http.post<{ cargaId: string; creadas: number }>(this.base, { periodoId, archivoNombre, cursos });
  }

  mias(periodoId?: string): Observable<OfertaCurso[]> {
    const params = periodoId ? new HttpParams().set('periodoId', periodoId) : undefined;
    return this.http.get<OfertaCurso[]>(`${this.base}/mias`, { params });
  }

  actualizar(id: string, datos: Partial<CursoOfertaDatos>): Observable<OfertaCurso> {
    return this.http.patch<OfertaCurso>(`${this.base}/${id}`, datos);
  }

  retirar(id: string) {
    return this.http.delete<{ mensaje: string }>(`${this.base}/${id}`);
  }

  // ── Administración ──
  listar(filtros: { periodoId?: string; estado?: EstadoOferta | ''; docenteId?: string }): Observable<OfertaCurso[]> {
    let params = new HttpParams();
    for (const [k, v] of Object.entries(filtros)) if (v) params = params.set(k, v);
    return this.http.get<OfertaCurso[]>(this.base, { params });
  }

  aprobar(id: string, datos: { asignaturaId: string; aulaId: string; nivelId?: string | null }) {
    return this.http.post<{ mensaje: string; cursoId: string; nivel: string | null }>(`${this.base}/${id}/aprobar`, datos);
  }

  rechazar(id: string, observacion: string) {
    return this.http.post<{ mensaje: string }>(`${this.base}/${id}/rechazar`, { observacion });
  }

  devolver(id: string, observacion: string) {
    return this.http.post<{ mensaje: string }>(`${this.base}/${id}/devolver`, { observacion });
  }
}
