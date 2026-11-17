import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'; // ajusta la ruta

export interface FilaAsistencia {
  inscripcionId: string;
  observacionInscripcion: string | null;
  nombre: string | null;
  apellido: string | null;
  documento: string | null;
  asistio: boolean | null;   // null = sin marcar
  observacion: string | null;
}

export interface ItemAsistencia {
  inscripcionId: string;
  asistio: boolean;
  observacion?: string;
}

export interface FechaRegistrada {
  fecha: string;
  total: number;
  presentes: number;
}

@Injectable({ providedIn: 'root' })
export class AsistenciasService {
  private http = inject(HttpClient);
  private base = `${environment.baseUrl}/asistencias`;

  lista(cursoId: string, fecha: string): Observable<FilaAsistencia[]> {
    return this.http.get<FilaAsistencia[]>(`${this.base}/curso/${cursoId}/lista`, {
      params: new HttpParams().set('fecha', fecha),
    });
  }

  guardarMasivo(cursoId: string, fecha: string, asistencias: ItemAsistencia[]): Observable<{ procesadas: number }> {
    return this.http.post<{ procesadas: number }>(`${this.base}/masivo`, { cursoId, fecha, asistencias });
  }

  fechas(cursoId: string): Observable<FechaRegistrada[]> {
    return this.http.get<FechaRegistrada[]>(`${this.base}/curso/${cursoId}/fechas`);
  }

  resumenCurso(cursoId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/curso/${cursoId}/resumen`);
  }

  historial(inscripcionId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/inscripcion/${inscripcionId}`);
  }

  resumenInscripcion(inscripcionId: string): Observable<any> {
    return this.http.get<any>(`${this.base}/inscripcion/${inscripcionId}/resumen`);
  }
}