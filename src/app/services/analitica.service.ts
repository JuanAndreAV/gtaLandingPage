import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Analitica } from '../models/analitica';

@Injectable({ providedIn: 'root' })
export class AnaliticaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.baseUrl}/reportes`;

  obtener(periodoId?: string): Observable<Analitica> {
    const params: Record<string, string> = {};
    if (periodoId) params['periodoId'] = periodoId;
    return this.http.get<Analitica>(`${this.apiUrl}/analitica`, { params });
  }
}
