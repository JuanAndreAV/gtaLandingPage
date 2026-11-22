import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'; // ajusta la ruta

export type EstadoAsistencia = 'presente' | 'tarde' | 'excusa' | 'ausente';

export interface ResumenAsistencia {
  sesiones: number;
  presentes: number;
  tardes: number;
  excusas: number;
  ausentes: number;
  porcentaje: number | null;  // (presente + tarde) / (sesiones - excusas)
}

export interface HistorialCurso {
  fechas: string[];
  filas: {
    inscripcionId: string;
    nombre: string | null;
    apellido: string | null;
    documento: string | null;
    registros: Record<string, { estado: EstadoAsistencia; observacion: string | null }>;
    resumen: ResumenAsistencia;
  }[];
}

export type MotivoNoRealizada = 'vacaciones' | 'festivo' | 'instruccion' | 'otro';

export const MOTIVOS_NO_REALIZADA: { valor: MotivoNoRealizada; etiqueta: string }[] = [
  { valor: 'vacaciones', etiqueta: 'Vacaciones' },
  { valor: 'festivo', etiqueta: 'Festivo' },
  { valor: 'instruccion', etiqueta: 'Por instrucciones de coordinación' },
  { valor: 'otro', etiqueta: 'Otro motivo' },
];

export interface ClaseNoRealizada {
  id: string;
  cursoId: string;
  fecha: string;
  motivo: MotivoNoRealizada;
  observacion: string | null;
}

export interface SeguimientoCurso {
  cursoId: string;
  curso: string;
  asignatura: string | null;
  nivel: string | null;
  docente: { id: string; nombre: string; email: string | null; telefono: string | null } | null;
  inscritos: number;
  dias: string[];
  noDictadas: { fecha: string; motivo: MotivoNoRealizada; observacion: string | null }[];
  reprogramadas: { original: string; nueva: string }[];
  esperadas: number;
  registradas: number;
  faltantes: string[];      // fechas sin asistencia, más recientes primero
  ultimaFecha: string | null;
  cumplimiento: number | null;
}

export interface SeguimientoAsistencia {
  periodo: { id: string; nombre: string; fechaInicio: string; fechaFin: string };
  desde: string;
  hasta: string;
  cursos: SeguimientoCurso[];
}

export interface FilaAsistencia {
  inscripcionId: string;
  observacionInscripcion: string | null;
  nombre: string | null;
  apellido: string | null;
  documento: string | null;
  asistio: boolean | null;   // null = sin marcar
  estado: EstadoAsistencia | null;
  observacion: string | null;
  resumen: ResumenAsistencia;
}

export interface ItemAsistencia {
  inscripcionId: string;
  estado: EstadoAsistencia;
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

  historialCurso(cursoId: string): Observable<HistorialCurso> {
    return this.http.get<HistorialCurso>(`${this.base}/curso/${cursoId}/historial`);
  }

  seguimiento(periodoId?: string): Observable<SeguimientoAsistencia> {
    const params = periodoId ? new HttpParams().set('periodoId', periodoId) : undefined;
    return this.http.get<SeguimientoAsistencia>(`${this.base}/seguimiento`, { params });
  }

  noRealizadas(cursoId: string): Observable<ClaseNoRealizada[]> {
    return this.http.get<ClaseNoRealizada[]>(`${this.base}/curso/${cursoId}/no-realizadas`);
  }

  marcarNoRealizada(cursoId: string, datos: { fecha: string; motivo: MotivoNoRealizada; observacion?: string }): Observable<ClaseNoRealizada> {
    return this.http.post<ClaseNoRealizada>(`${this.base}/curso/${cursoId}/no-realizadas`, datos);
  }

  quitarNoRealizada(id: string) {
    return this.http.delete<{ mensaje: string }>(`${this.base}/no-realizadas/${id}`);
  }

  registrarReceso(datos: { periodoId: string; desde: string; hasta: string; motivo: MotivoNoRealizada; observacion?: string }) {
    return this.http.post<{ marcadas: number; cursos: number }>(`${this.base}/receso`, datos);
  }

  misPendientes(): Observable<SeguimientoAsistencia> {
    return this.http.get<SeguimientoAsistencia>(`${this.base}/mis-pendientes`);
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