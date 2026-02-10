import { inject, Injectable, signal, computed } from '@angular/core';
import { environment } from '../../environments/environment';
import { CursoQ10 } from '../models/curso-q10';
import { EstudianteQ10 } from '../models/estudiante-q10';
import { HttpClient } from '@angular/common/http';
import { catchError, delay, finalize, Observable, of, switchMap, tap } from 'rxjs';

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
    return this.http.get<CursoQ10[]>(`${this.q10ApiUrl}/cursos?Limit=600&Offset=0`, {
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

  // En Q10Service
obtenerTodosLosEstudiantes(periodo: number): Observable<EstudianteQ10[]> {
  this.isLoading.set(true);

  const url = `${this.q10ApiUrl}/estudiantes?Periodo=${periodo}&Limit=1000&Offset=0`;

  return this.http.get<EstudianteQ10[]>(url, { 
    headers: { 
      'Api-key': this.q10ApiKey, 
      'Cache-Control': 'no-cache'
    }
  }).pipe(
    tap(data => {
      console.log(`✅ ${data.length} estudiantes totales obtenidos`);
    }),
    catchError(err => {
      console.error('❌ Error al obtener todos los estudiantes:', err);
      return of([]);
    }),
    finalize(() => this.isLoading.set(false))
  );
}



// Método para obtener todos los estudiantes y detectar duplicados



  // En Q10Service

// Signal para almacenar TODOS los estudiantes del periodo
public todosLosEstudiantes = signal<EstudianteQ10[]>([]);
public cargandoTodosEstudiantes = signal<boolean>(false);

// Método mejorado con paginación para obtener TODOS los estudiantes
obtenerTodosLosEstudiantesPeriodo(periodo: number): Observable<EstudianteQ10[]> {
  this.cargandoTodosEstudiantes.set(true);
  
  return this.obtenerEstudiantesPaginados(periodo, 0, []).pipe(
    tap(todosLosEstudiantes => {
      console.log(`✅ Total de ${todosLosEstudiantes.length} estudiantes obtenidos para análisis`);
      this.todosLosEstudiantes.set(todosLosEstudiantes);
    }),
    catchError(err => {
      console.error('❌ Error al obtener todos los estudiantes:', err);
      return of([]);
    }),
    finalize(() => this.cargandoTodosEstudiantes.set(false))
  );
}

// Método recursivo para obtener todos los estudiantes con paginación
private obtenerEstudiantesPaginados(
  periodo: number, 
  offset: number, 
  acumulados: EstudianteQ10[]
): Observable<EstudianteQ10[]> {
  // Usar el límite máximo que permita tu API
  const limit = 600; // Cambia esto según lo que permita tu API
  const url = `${this.q10ApiUrl}/estudiantes?Periodo=${periodo}&Limit=${limit}&Offset=${offset}`;

  console.log(`📄 Página ${Math.floor(offset / limit) + 1}: Offset=${offset}, Limit=${limit}`);
  console.log(`   Progreso: ${acumulados.length} estudiantes acumulados`);

  return this.http.get<EstudianteQ10[]>(url, { 
    headers: { 
      'Api-key': this.q10ApiKey, 
      'Cache-Control': 'no-cache'
    }
  }).pipe(
    switchMap(data => {
      const nuevoAcumulado = [...acumulados, ...data];
      
      console.log(`   ✓ Recibidos: ${data.length} registros`);
      console.log(`   📊 Total acumulado: ${nuevoAcumulado.length} estudiantes`);
      
      // Continuar si recibimos exactamente 'limit' registros
      if (data.length === limit) {
        console.log(`   ⏭️ Hay más datos, obteniendo siguiente página...\n`);
        // Pequeño delay para no saturar la API (opcional)
        return of(null).pipe(
          delay(100), // 100ms de delay entre requests
          switchMap(() => this.obtenerEstudiantesPaginados(periodo, offset + limit, nuevoAcumulado))
        );
      } else {
        console.log(`\n✅ PAGINACIÓN COMPLETADA`);
        console.log(`   Total de páginas: ${Math.floor(offset / limit) + 1}`);
        console.log(`   Total de estudiantes: ${nuevoAcumulado.length}`);
        console.log(`═══════════════════════════════════════════════════════\n`);
        return of(nuevoAcumulado);
      }
    }),
    catchError(err => {
      console.error(`\n❌ ERROR en offset ${offset}:`);
      console.error(`   Mensaje: ${err.message}`);
      console.error(`   Estudiantes recuperados hasta ahora: ${acumulados.length}`);
      console.warn(`⚠️ Continuando con los datos obtenidos...\n`);
      return of(acumulados);
    })
  );
}
}