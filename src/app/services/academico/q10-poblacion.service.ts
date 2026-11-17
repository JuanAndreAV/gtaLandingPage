import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PoblacionQ10 } from '../../models/poblacion-q10';
import { Observable, catchError, of, tap, finalize, expand, reduce, EMPTY } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Q10PoblacionService {
  private http = inject(HttpClient);
  private q10ApiUrl = environment.q10Api;
  private q10ApiKey = environment.q10ApiKey;

  private endpoint = `${this.q10ApiUrl}/comunidad-excel/estudiantes?Fecha_inicio_matricula=2026-01-01&Fecha_fin_matricula=2026-12-30&Estado=T&Incluir_info_adicional=false&Incluir_info_matricula=true&Incluir_info_academica=true&Incluir_info_laboral=false&Incluir_preguntas_personalizadas=true&Incluir_info_familiares=false`;

  public isLoading = signal<boolean>(false);
  public error = signal<string | null>(null);
  public poblacionQ10 = signal<PoblacionQ10[]>([]);
  public progresoCarga = signal<{ actual: number; total: number; porcentaje: number }>({
    actual: 0,
    total: 0,
    porcentaje: 0
  });

  public obtenerPoblacionQ10(offset: number = 0): Observable<PoblacionQ10[]> {
    this.isLoading.set(true);
    this.error.set(null);
    const limit = 4000;

    // Función interna para cada petición individual
    const fetchPagina = (currentOffset: number) =>
      this.http.get<PoblacionQ10[]>(`${this.endpoint}&Limit=${limit}&Offset=${currentOffset}`, {
        headers: {
          'Api-key': this.q10ApiKey,
          'Cache-Control': 'no-cache'
        }
      });

    let offsetActual = offset;

    return fetchPagina(offsetActual).pipe(
      // 1. Si el bloque trae exactamente 3000 registros, pide el siguiente offset automáticamente
      expand((data) => {
        if (data && data.length === limit) {
          offsetActual += limit;
          return fetchPagina(offsetActual);
        }
        return EMPTY; // Detiene la recursión cuando llegan menos de 3000 registros
      }),
      // 2. Junta todos los lotes en un único array completo
      reduce((acumulado, lote) => [...acumulado, ...lote], [] as PoblacionQ10[]),
      // 3. Guarda toda la data completa en la señal y dispara tus computed una sola vez
      tap((dataCompleta) => {
        this.poblacionQ10.set(dataCompleta);
      }),
      catchError((err) => {
        this.error.set(err.message);
        return of([]);
      }),
      finalize(() => this.isLoading.set(false))
    );
  }
}