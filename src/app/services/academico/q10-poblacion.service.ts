import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PoblacionQ10 } from '../../models/poblacion-q10';
import { Observable, catchError, of, tap, finalize} from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class Q10PoblacionService {
  private http = inject(HttpClient);
  private q10ApiUrl = environment.q10Api;
  private q10ApiKey = environment.q10ApiKey;

  private endpoint = `${this.q10ApiUrl}/comunidad-excel/estudiantes?Fecha_inicio_matricula=2026-02-09&Fecha_fin_matricula=2026-04-11&Estado=T&Incluir_info_adicional=false&Incluir_info_matricula=true&Incluir_info_academica=true&Incluir_info_laboral=false&Incluir_preguntas_personalizadas=true&Incluir_info_familiares=false`;

  public isLoading = signal<boolean>(false);
  public error = signal<string | null>(null);
  public poblacionQ10 = signal<PoblacionQ10[]>([]);
  public progresoCarga = signal<{ actual: number; total: number; porcentaje: number }>({
    actual: 0,
    total: 0,
    porcentaje: 0
  });

  public obtenerPoblacionQ10( offset: number): Observable<PoblacionQ10[]>{
    this.isLoading.set(true);
    this.error.set(null);
    let limit = 500;
    
    return this.http.get<PoblacionQ10[]>(`${this.endpoint}&Limit=${limit}&Offset=${3}`, {
      headers: {
        'Api-key': this.q10ApiKey,
        'Cache-Control': 'no-cache'
      }
    }).pipe(
      tap(data => this.poblacionQ10.set(data)
    ),
      catchError(err => {
        this.error.set(err.message);
        return of([]);
      }),
      finalize(() => this.isLoading.set(false))
    )
  } 

 
  
  
}
