import { Injectable, signal, computed, inject} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

import { Observable, catchError, of, tap, finalize} from 'rxjs';
import { EstudianteQ10 } from '../../models/estudiante-q10';
import { AsistenciaQ10 } from '../../models/asistencia-q10';
import { InasistenciaQ10 } from '../../models/inasistencia-q10';

@Injectable({
  providedIn: 'root',
})
export class Q10AsistenciaService {
  private http = inject(HttpClient);
  private q10ApiUrl = environment.q10Api;
  private q10ApiKey = environment.q10ApiKey;

  public asistencia = signal<AsistenciaQ10[]>([]);
  public inasistencia = signal<InasistenciaQ10[]>([]);

  public totalPersonasMatriculadas = signal<number>(0);//1531
  public totalInscripcionesActivas = signal<number>(0);//1782
  public totalCursosOfertados = signal<number>(0);//303

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
  mes = computed(() => {
    const date = new Date();
    return date.toISOString().split("T")[0].split("-")[1]; // getMonth() devuelve un valor entre 0 y 11, por eso se suma 1
  });

  public obtenerInasistencia(fechaInicio: string, fechaFin: string): Observable<InasistenciaQ10[]>{
    this.isLoading.set(true);
    this.inasistencia.set([]);
    this.error.set(null);
    const url = `${this.q10ApiUrl}/inasistencias?Fecha_inicio_inasistencia=${fechaInicio}&Fecha_fin_inasistencia=${fechaFin}&Limit=1000&Offset=0`;
 if(fechaInicio && fechaFin){
  return this.http.get<InasistenciaQ10[]>(url, {
    headers: {
      'Api-key': this.q10ApiKey,
      'Cache-Control': 'no-cache'
    }
  }).pipe(
    tap(data => this.inasistencia.set(data)),
    catchError(err => {
      this.error.set(err.message);
      return of([]);
    }),
    finalize(() => this.isLoading.set(false))
  );
 }
  return of([]);
}
actualizarDatos(personasMatriculadas: number, inscripcionesActivas: number, cursosOfertados: number){
  this.totalPersonasMatriculadas.update(() => personasMatriculadas);
  this.totalInscripcionesActivas.update(() => inscripcionesActivas);
  this.totalCursosOfertados.update(() => cursosOfertados);
}

datosInasistencia = computed(() => {
  const data = this.inasistencia(); // Array de estudiantes que han faltado
  
  
  const totalPersonasMatriculadas = this.totalPersonasMatriculadas();
  const totalInscripcionesActivas = this.totalInscripcionesActivas();
  const totalCursosOfertados = this.totalCursosOfertados();
  if (!data || !data.length) return null;

  // --- 1. CÁLCULOS DE PERSONAS (ALCANCE SOCIAL) ---
  const personasConFaltas = data.length;
  const hombresInasistentes = data.filter(e => e.Sexo === 'M').length;
  const mujeresInasistentes = data.filter(e => e.Sexo === 'F').length;

  // --- 2. CÁLCULOS DE INSCRIPCIONES Y FALTAS ---
  let totalFaltasAbsolutas = 0;
  let cuposAfectadosPorFaltas = 0;
  const mapaCursos: { [key: string]: { curso: string, inasistencias: number, alumnos: number, profesor: string } } = {};

  data.forEach(estudiante => {
    // Cada elemento en 'Cursos' representa una inscripción de esa persona
    cuposAfectadosPorFaltas += estudiante.Cursos.length;

    estudiante.Cursos.forEach(curso => {
      // Sumamos la intensidad de las faltas
      totalFaltasAbsolutas += curso.Cantidad_inasistencia;

      // Agrupamos por nombre de curso para el Top Críticos
      if (!mapaCursos[curso.Nombre_curso]) {
        mapaCursos[curso.Nombre_curso] = { 
          curso: curso.Nombre_curso, 
          inasistencias: 0, 
          alumnos: 0 ,
          profesor: curso.Nombre_docente
        };
      }
      mapaCursos[curso.Nombre_curso].inasistencias += curso.Cantidad_inasistencia;
      mapaCursos[curso.Nombre_curso].alumnos += 1;
    });
  });

  // --- 3. ORDENAMIENTO DE CURSOS CRÍTICOS (TOP 10) ---
  const cursosCriticos = Object.values(mapaCursos)
    .sort((a, b) => b.inasistencias - a.inasistencias)
    .slice(0, 10);

  // --- 4. CÁLCULO DE TASAS (PORCENTAJES REALES) ---
  // % de ciudadanos de la Casa de la Cultura que han faltado al menos una vez
  const tasaAlcanceInasistencia = +((personasConFaltas / totalPersonasMatriculadas) * 100).toFixed(1);
  
  // % de cupos/inscripciones que presentan inasistencia
  const tasaInscripcionesAfectadas = +((cuposAfectadosPorFaltas / totalInscripcionesActivas) * 100).toFixed(1);

  // Frecuencia: ¿Cuántas veces falta en promedio un alumno que ya empezó a faltar?
  const promedioFaltasPorPersona = +(totalFaltasAbsolutas / personasConFaltas).toFixed(1);

  // --- OBJETO FINAL PARA LA IA ---
  return {
    reporteGeneral: {
      totalPersonasMatriculadas,
      totalInscripcionesActivas,
      totalCursosOfertados
    },
    estadisticasPersonas: {
      totalConFaltas: personasConFaltas,
      hombres: hombresInasistentes,
      mujeres: mujeresInasistentes,
      tasaAfectacionCiudadana: tasaAlcanceInasistencia // Ej: "El 38% de los matriculados ha faltado"
    },
    estadisticasCupos: {
      totalCuposAfectados: cuposAfectadosPorFaltas,
      tasaDesercionCupos: tasaInscripcionesAfectadas, // Ej: "El 25% de los cupos tiene inasistencias"
      totalFaltasRegistradas: totalFaltasAbsolutas,
      promedioFaltasPorPersona
    },
    cursosCriticos, // Array Top 10
    resumenImpacto: `Se han registrado ${totalFaltasAbsolutas} inasistencias que afectan al ${tasaInscripcionesAfectadas}% de los cupos totales de la institución.`
  };
});


}
  
