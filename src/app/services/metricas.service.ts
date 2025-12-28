import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MetricasAdmin, DesercionAnalisis, AsistenciaMetrica } from '../models/metricas';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MetricasService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.baseUrl;

  getMetricasAdmin(): Observable<MetricasAdmin> {
    return this.http.get<MetricasAdmin>(`${this.apiUrl}metricas/admin/dashboard`);
  }

  getAnalisisDesercion(): Observable<DesercionAnalisis> {
    return this.http.get<DesercionAnalisis>(`${this.apiUrl}metricas/desercion`);
  }

  getMetricasAsistencia(): Observable<AsistenciaMetrica[]> {
    return this.http.get<AsistenciaMetrica[]>(`${this.apiUrl}metricas/asistencia`);
  }

  exportarReporte(tipo: 'excel' | 'pdf', filtros?: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/metricas/export/${tipo}`, filtros, {
      responseType: 'blob'
    });
  }
}

