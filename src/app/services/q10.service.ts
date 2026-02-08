import { inject, Injectable, signal, computed } from '@angular/core';
import { environment } from '../../environments/environment';
import { CursoQ10 } from '../models/curso-q10';
import { EstudianteQ10 } from '../models/estudiante-q10';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Q10Service {
  private http = inject(HttpClient);
  private q10ApiUrl = environment.q10Api;
  private q10ApiKey = environment.q10ApiKey;

  public cursos = signal<CursoQ10[]>([]);
  public estudiantes = signal<EstudianteQ10[]>([]);

  public isLoading = signal<boolean>(false);
  public error = signal<string | null>(null);

  public obtenerCursos(): Observable<CursoQ10[]> {
    this.isLoading.set(true);
    this.error.set(null);
    return this.http.get<CursoQ10[]>(`${this.q10ApiUrl}/cursos?Limit=400&Offset=0`, {
      headers: { 'Api-key': this.q10ApiKey, 'Cache-Control': 'no-cache' }
    }).pipe(
      tap(data => this.cursos.set(data)),
      catchError(err => {
        this.error.set(err.message);
        return of([]);
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  obtenerEstudiantesPorCurso(periodo: number, sedeJornada: number, cursoId: number): Observable<EstudianteQ10[]> {
    this.isLoading.set(true);
    this.estudiantes.set([]); 

    // Solo filtramos por Periodo y Curso (removemos Sede_jornada)
    const url = `${this.q10ApiUrl}/estudiantes?Periodo=${periodo}&Curso=${cursoId}&Limit=100&Offset=0`;

    return this.http.get<EstudianteQ10[]>(url, { 
      headers: { 
        'Api-key': this.q10ApiKey, 
        'Cache-Control': 'no-cache'
      }
    }).pipe(
      tap(data => {
        console.log(`✅ ${data.length} estudiante(s) encontrado(s)`);
        this.estudiantes.set(data);
      }),
      catchError(err => {
        console.error('❌ Error:', err);
        this.error.set('No se pudieron obtener los estudiantes');
        return of([]);
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  // --- Lógica de Negocio (Signals Computadas) ---
  
  public listaDocentes = computed(() => {
    const nombres = this.cursos().map(c => c.Nombre_docente);
    return [...new Set(nombres)].sort();
  });

  public statsAdmin = computed(() => {
    const data = this.cursos();
    return {
      totalCursos: data.length,
      totalMatriculados: data.reduce((acc, c) => acc + c.Cantidad_estudiantes_matriculados, 0),
      cuposTotales: data.reduce((acc, c) => acc + c.Cupo_maximo, 0)
    };
  });
}