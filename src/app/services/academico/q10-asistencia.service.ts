import { Injectable, signal, computed, inject} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

import { Observable, catchError, of, tap, finalize} from 'rxjs';
import { EstudianteQ10 } from '../../models/estudiante-q10';
import { AsistenciaQ10 } from '../../models/asistencia-q10';

@Injectable({
  providedIn: 'root',
})
export class Q10AsistenciaService {
  private http = inject(HttpClient);
  private q10ApiUrl = environment.q10Api;
  private q10ApiKey = environment.q10ApiKey;

  public asistencia = signal<AsistenciaQ10[]>([]);
  public isLoading = signal<boolean>(false);
  public error = signal<string | null>(null);
  
  public obtenerAsistencia(programa: string, asignatura: string, curso?: string): Observable<AsistenciaQ10[]>{
    this.isLoading.set(true);
    this.asistencia.set([]);
    this.error.set(null);
    let url = `${this.q10ApiUrl}/evaluaciones/cuantitativo/notas?Consecutivo_periodo=3&Codigo_programa=${programa}&Codigo_asignatura=${asignatura}`;
    if(curso){
      url += `&Consecutivo_curso=${curso}`;
    }
    return this.http.get<AsistenciaQ10[]>(url, {
      headers: {
        'Api-key': this.q10ApiKey,
        'Cache-Control': 'no-cache'
      }
    }).pipe(
      tap(data => this.asistencia.set(data)),
      catchError(err => {
        this.error.set(err.message);
        return of([]);
      }),
      finalize(() => this.isLoading.set(false))
    )
  }

  
}
