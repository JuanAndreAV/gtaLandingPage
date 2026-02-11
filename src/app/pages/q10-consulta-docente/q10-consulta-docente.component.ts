import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { Q10Service } from '../../services/q10.service';
import { EstudianteQ10 } from '../../models/estudiante-q10';

interface AlertaCupo {
  curso: any;
  tipo: 'lleno' | 'proximo' | 'normal';
  porcentaje: number;
}

interface InscripcionDetalle {
  nombreCurso: string;
  nombrePrograma: string;
  codigoPrograma: string;
  nombreDocente: string;
  sede: string;
  jornada: string;
  fechaMatricula: string;
  consecutivoCurso: string;
}

interface EstudianteDuplicado {
  codigoEstudiante: string;
  nombre: string;
  email: string;
  celular: string;
  inscripciones: InscripcionDetalle[];
  totalCursos: number;
  totalProgramas: number;
  programas: string[];
}

@Component({
  selector: 'app-q10-consulta-docente',
  standalone: true, // Asegúrate de si es standalone o no según tu proyecto
  imports: [], 
  templateUrl: './q10-consulta-docente.component.html',
  styleUrl: './q10-consulta-docente.component.css',
})
export class Q10ConsultaDocenteComponent implements OnInit {
  public q10Service = inject(Q10Service);
  
  public docenteSeleccionado = signal<string>('');
  public cursoActivo = signal<any>(null);
  public mostrarPanelAlertas = signal<boolean>(false);
  public mostrarPanelDuplicados = signal<boolean>(false);

  // Cursos filtrados por el docente elegido
  public misCursos = computed(() => {
    const seleccion = this.docenteSeleccionado();
    return this.q10Service.cursos().filter(c => c.Nombre_docente === seleccion);
  });

  // Estadísticas totales del docente
  public estadisticas = computed(() => {
    const cursos = this.misCursos();
    return {
      totalCursos: cursos.length,
      totalEstudiantes: cursos.reduce((sum, c) => sum + (c.Cantidad_estudiantes_matriculados || 0), 0),
      cursosActivos: cursos.filter(c => c.Estado === 'Activo').length
    };
  });

  // Alertas de cupo solo para mis cursos
  public alertasCupoMisCursos = computed(() => {
    return this.generarAlertasCupo(this.misCursos());
  });

  // Alertas tempranas en el header
  public alertasTempranasCupo = computed(() => {
    const cursos = this.q10Service.cursos();
    const alertas = this.generarAlertasCupo(cursos);
    
    return {
      total: alertas.length,
      llenos: alertas.filter(a => a.tipo === 'lleno').length,
      proximos: alertas.filter(a => a.tipo === 'proximo').length,
      alertas: alertas.slice(0, 5)
    };
  });

  // Análisis completo de inscripciones múltiples
  public analisisInscripcionesMultiples = computed(() => {
    const todosEstudiantes = this.q10Service.todosLosEstudiantes();
    
    if (todosEstudiantes.length === 0) {
      return {
        total: 0,
        estudiantes: [] as EstudianteDuplicado[],
        porPrograma: new Map<string, number>(),
        severidad: 'baja' as 'baja' | 'media' | 'alta',
        estadisticas: {
          totalInscripciones: 0,
          conMultiplesCursos: 0,
          conMultiplesProgramas: 0,
          maximoInscripciones: 0,
          promedioInscripciones: 0
        }
      };
    }

    const porEstudiante = new Map<string, any[]>();
    
    todosEstudiantes.forEach(est => {
      const codigo = est.Codigo_estudiante;
      if (!porEstudiante.has(codigo)) {
        porEstudiante.set(codigo, []);
      }
      porEstudiante.get(codigo)?.push(est);
    });

    const duplicados: EstudianteDuplicado[] = [];
    const programasAfectados = new Map<string, number>();
    let conMultiplesProgramas = 0;
    let maximoInscripciones = 0;
    let totalInscripcionesDuplicadas = 0;

    porEstudiante.forEach((inscripciones, codigo) => {
      if (inscripciones.length > 1) {
        const programasUnicos = new Set(inscripciones.map((i: any) => i.Codigo_programa));

        if (inscripciones.length > maximoInscripciones) maximoInscripciones = inscripciones.length;
        totalInscripcionesDuplicadas += inscripciones.length;
        if (programasUnicos.size > 1) conMultiplesProgramas++;

        const detallesInscripciones: InscripcionDetalle[] = inscripciones.map((est: any) => {
          const cursoInfo = this.obtenerInfoCurso(est);
          return {
            nombreCurso: cursoInfo.nombre,
            nombrePrograma: est.Nombre_programa || 'N/A',
            codigoPrograma: est.Codigo_programa || 'N/A',
            nombreDocente: cursoInfo.docente,
            sede: est.Nombre_sede || 'N/A',
            jornada: est.Nombre_jornada || 'N/A',
            fechaMatricula: est.Fecha_matricula,
            consecutivoCurso: cursoInfo.consecutivo
          };
        });

        const primerEstudiante = inscripciones[0];
        duplicados.push({
          codigoEstudiante: codigo,
          nombre: `${primerEstudiante.Primer_nombre || ''} ${primerEstudiante.Segundo_nombre || ''} ${primerEstudiante.Primer_apellido || ''} ${primerEstudiante.Segundo_apellido || ''}`.trim(),
          email: primerEstudiante.Email || 'N/A',
          celular: primerEstudiante.Celular || 'N/A',
          inscripciones: detallesInscripciones,
          totalCursos: inscripciones.length,
          totalProgramas: programasUnicos.size,
          programas: Array.from(programasUnicos)
        });

        programasUnicos.forEach(p => programasAfectados.set(p as string, (programasAfectados.get(p as string) || 0) + 1));
      }
    });

    duplicados.sort((a, b) => b.totalCursos - a.totalCursos);

    let severidad: 'baja' | 'media' | 'alta' = 'baja';
    if (duplicados.length > 20) severidad = 'alta';
    else if (duplicados.length > 10) severidad = 'media';

    return {
      total: duplicados.length,
      estudiantes: duplicados,
      porPrograma: programasAfectados,
      severidad,
      estadisticas: {
        totalInscripciones: todosEstudiantes.length,
        conMultiplesCursos: duplicados.length,
        conMultiplesProgramas,
        maximoInscripciones,
        promedioInscripciones: duplicados.length > 0 ? Math.round((totalInscripcionesDuplicadas / duplicados.length) * 10) / 10 : 0
      }
    };
  });

  public estudiantesDuplicados = computed(() => {
    const estudiantesActuales = this.q10Service.estudiantes();
    const analisisGlobal = this.analisisInscripcionesMultiples();
    if (estudiantesActuales.length === 0) return [];
    return estudiantesActuales
      .map(est => analisisGlobal.estudiantes.find(d => d.codigoEstudiante === est.Codigo_estudiante))
      .filter(d => d !== undefined) as EstudianteDuplicado[];
  });

  ngOnInit() {
    this.q10Service.obtenerCursos().subscribe(() => {
      // Período 3 como definiste originalmente
      this.q10Service.obtenerTodosLosEstudiantesPeriodo(3).subscribe();
    });
  }

  seleccionarDocente(nombre: string) {
    this.docenteSeleccionado.set(nombre);
    this.cursoActivo.set(null);
    this.q10Service.estudiantes.set([]);
  }

  verAlumnos(curso: any) {
    this.cursoActivo.set(curso);
    this.q10Service.obtenerEstudiantesPorCurso(curso.Consecutivo_periodo, curso.Consecutivo_sede_jornada, curso.Consecutivo).subscribe();
  }

  private generarAlertasCupo(cursos: any[]): AlertaCupo[] {
    return cursos.map(curso => {
      const matriculados = curso.Cantidad_estudiantes_matriculados || 0;
      const cupoMaximo = curso.Cupo_maximo || 0;
      if (cupoMaximo === 0) return null;
      const porcentaje = (matriculados / cupoMaximo) * 100;
      let tipo: 'lleno' | 'proximo' | 'normal' = 'normal';
      if (porcentaje >= 100) tipo = 'lleno';
      else if (porcentaje >= 80) tipo = 'proximo';
      return tipo !== 'normal' ? { curso, tipo, porcentaje: Math.round(porcentaje) } : null;
    }).filter(a => a !== null) as AlertaCupo[];
  }

  getEstadoCupo(curso: any) {
    const matriculados = curso.Cantidad_estudiantes_matriculados || 0;
    const cupoMaximo = curso.Cupo_maximo || 0;
    if (cupoMaximo === 0) return { tipo: 'sin-cupo', porcentaje: 0, clase: 'bg-gray-100 text-gray-600' };
    const porcentaje = Math.round((matriculados / cupoMaximo) * 100);
    if (porcentaje >= 100) return { tipo: 'lleno', porcentaje, clase: 'bg-red-100 text-red-700 border-red-300' };
    if (porcentaje >= 80) return { tipo: 'proximo', porcentaje, clase: 'bg-amber-100 text-amber-700 border-amber-300' };
    return { tipo: 'disponible', porcentaje, clase: 'bg-green-100 text-green-700 border-green-300' };
  }

  verificarDuplicadosEstudiante(codigoEstudiante: string): boolean {
    return this.estudiantesDuplicados().some(dup => dup.codigoEstudiante === codigoEstudiante);
  }

  togglePanelAlertas() { this.mostrarPanelAlertas.update(v => !v); }
  togglePanelDuplicados() { this.mostrarPanelDuplicados.update(v => !v); }

  imprimirReporteDuplicados() {
    console.log('📋 REPORTE DE DUPLICADOS', this.analisisInscripcionesMultiples());
  }

  private obtenerInfoCurso(estudiante: any) {
    const cursoEncontrado = this.q10Service.cursos().find(c => 
      c.Codigo_programa === estudiante.Codigo_programa &&
      c.Consecutivo_sede_jornada === estudiante.Consecutivo_sedejornada
    );
    return {
      nombre: cursoEncontrado?.Nombre || estudiante.Nombre_programa || 'Curso no identificado',
      docente: cursoEncontrado?.Nombre_docente || 'No asignado',
      consecutivo: cursoEncontrado?.Consecutivo?.toString() || 'N/A'
    };
  }

  mapToArray(map: Map<string, number>) {
    return Array.from(map.entries()).map(([key, value]) => ({key, value}));
  }
}