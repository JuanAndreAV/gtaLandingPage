import { Component, inject, computed, signal, OnInit} from '@angular/core';
import { Q10Service } from '../../services/q10.service';
import { TableComponent } from '../../shared/components/table/table.component';



interface MetricaKPI {
  titulo: string;
  valor?: number | string;
  subtitulo?: string;
  tendencia?: 'up' | 'down' | 'neutral';
  porcentajeCambio?: number;
  icono: string;
  color: string;
}

interface AnalisisPrograma {
  codigo: string;
  nombre: string;
  cursos: number;
  inscritos: number;
  cupoTotal: number;
  ocupacion: number;
  docentes: Set<string>;
}

@Component({
  selector: 'app-reportes',
  imports: [TableComponent],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css',
})
export class ReportesComponent implements OnInit {
  public q10Service = inject(Q10Service);
  
  public fechaGeneracion = new Date();
  public periodoActual = '2026-1';
    ngOnInit() {
    this.q10Service.obtenerCursos().subscribe(() => {
      
      this.q10Service.obtenerTodosLosEstudiantesPeriodo(3).subscribe();
    });
  }
public theadItems = signal<any[]>(['Programa','Cursos','Inscritos','Cupo total','Ocupacion','Docentes']);

  // KPIs principales
  public kpis = computed((): MetricaKPI[] => {
    const cursos = this.q10Service.statsAdmin()
    const estudiantes = this.q10Service.todosLosEstudiantes();

    
    
    const totalInscritos = cursos.totalMatriculados || 0;
    const cupoTotal = cursos.cuposTotales || 0;
    const ocupacionGeneral = cupoTotal > 0 ? (totalInscritos / cupoTotal) * 100 : 0;
    const docentes = this.q10Service.listaDocentes().length;
    //new Set(cursos.map(c => c.Nombre_docente)).size;
    
    return [
      {
        titulo: 'Total Inscripciones',
        valor: totalInscritos,
        subtitulo: `de ${cupoTotal.toLocaleString()} cupos disponibles`,
        tendencia: ocupacionGeneral > 75 ? 'up' : 'neutral',
        porcentajeCambio: Math.round(ocupacionGeneral),
        icono: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
        color: 'from-blue-500 to-indigo-600'
      },
      {
        titulo: 'Cursos Activos',
        valor: cursos.totalCursos,
        subtitulo: `${this.q10Service.cursos().filter(c => c.Estado === 'Abierto').length} activos`,
        //tendencia: , //`${cursos.filter(c => c.Estado === 'Activo').length} activos`,
        icono: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
        color: 'from-purple-500 to-pink-600'
      },
      {
        titulo: 'Ocupación Promedio',
        valor: `${Math.round(ocupacionGeneral)}%`,
        subtitulo: ocupacionGeneral > 80 ? 'Alta demanda' : 'Capacidad disponible',
        tendencia: ocupacionGeneral > 80 ? 'up' : ocupacionGeneral > 50 ? 'neutral' : 'down',
        icono: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
        color: ocupacionGeneral > 80 ? 'from-red-500 to-orange-600' : 'from-green-500 to-teal-600'
      },
      {
        titulo: 'Docentes',
        valor: docentes,
        subtitulo: `${(totalInscritos / docentes).toFixed(0)} estudiantes/docente promedio`,
        icono: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
        color: 'from-amber-500 to-orange-600'
      }
    ];
  });

  // Análisis por programa
  public analisisPorPrograma = computed(() => {
    const cursos = this.q10Service.cursos();
    const programas = new Map<string, AnalisisPrograma>();

    cursos.forEach(curso => {
      const codigo = curso.Codigo_programa || 'N/A';
      
      if (!programas.has(codigo)) {
        programas.set(codigo, {
          codigo,
          nombre: curso.Nombre_programa || codigo,
          cursos: 0,
          inscritos: 0,
          cupoTotal: 0,
          ocupacion: 0,
          docentes: new Set()
        });
      }

      const programa = programas.get(codigo)!;
      programa.cursos++;
      programa.inscritos += curso.Cantidad_estudiantes_matriculados || 0;
      programa.cupoTotal += curso.Cupo_maximo || 0;
      programa.docentes.add(curso.Nombre_docente);
    });

    // Calcular ocupación
    const resultado = Array.from(programas.values()).map(p => ({
      ...p,
      ocupacion: p.cupoTotal > 0 ? (p.inscritos / p.cupoTotal) * 100 : 0,
      numeroDocentes: p.docentes.size
    }));

    // Ordenar por inscripciones descendente
    return resultado.sort((a, b) => b.inscritos - a.inscritos);
  });

  // Top 10 cursos más demandados
  public top10CursosDemandados = computed(() => {
    return this.q10Service.cursos()
      .filter(c => c.Cantidad_estudiantes_matriculados > 0)
      .sort((a, b) => b.Cantidad_estudiantes_matriculados - a.Cantidad_estudiantes_matriculados)
      .slice(0, 10);
  });

  // Cursos en riesgo de cierre (baja ocupación)
 
  public cursosMenorOcupacion = computed(()=>{
    return this.q10Service.cursos()
    .filter(curso=> {
      const ocupacion = curso.Cupo_maximo >= 0 ? (curso.Cantidad_estudiantes_matriculados / curso.Cupo_maximo) * 100 : 0;
      return ocupacion < 30 //&& curso.Estado === 'Activo';
    })
    .sort((a, b) => a.Cantidad_estudiantes_matriculados - b.Cantidad_estudiantes_matriculados)
    //.slice(0, 10);
  })

  // Distribución por sede y jornada
  public distribucionSedeJornada = computed(() => {
    const cursos = this.q10Service.cursos();
    const distribucion = new Map<string, { cursos: number; inscritos: number }>();

    cursos.forEach(curso => {
      const key = `${curso.Nombre_sede_jornada || 'N/A'} - ${curso.Nombre_asignatura || 'N/A'}`;
      
      if (!distribucion.has(key)) {
        distribucion.set(key, { cursos: 0, inscritos: 0 });
      }

      const dist = distribucion.get(key)!;
      dist.cursos++;
      dist.inscritos += curso.Cantidad_estudiantes_matriculados || 0;
    });

    return Array.from(distribucion.entries())
      .map(([nombre, datos]) => ({ nombre, ...datos }))
      .sort((a, b) => b.inscritos - a.inscritos);
  });

  // Análisis de docentes
  public analisisDocentes = computed(() => {
    const cursos = this.q10Service.cursos();
    const docentes = new Map<string, { cursos: number; estudiantes: number; programas: Set<string> }>();

    cursos.forEach(curso => {
      const nombre = curso.Nombre_docente || 'N/A';
      
      if (!docentes.has(nombre)) {
        docentes.set(nombre, { cursos: 0, estudiantes: 0, programas: new Set() });
      }

      const docente = docentes.get(nombre)!;
      docente.cursos++;
      docente.estudiantes += curso.Cantidad_estudiantes_matriculados || 0;
      docente.programas.add(curso.Codigo_programa || 'N/A');
    });

    return Array.from(docentes.entries())
      .map(([nombre, datos]) => ({
        nombre,
        cursos: datos.cursos,
        estudiantes: datos.estudiantes,
        programas: datos.programas.size,
        promedioEstudiantes: (datos.estudiantes / datos.cursos).toFixed(1)
      }))
      .sort((a, b) => b.estudiantes - a.estudiantes);
  });

  // Método para exportar a PDF
  exportarPDF() {
    window.print();
  }

  // Método para exportar a Excel
  exportarExcel() {
    // Implementación con librería como exceljs o xlsx
    console.log('Exportando a Excel...');
  }

  // Método para copiar datos al portapapeles
  copiarDatos() {
    const datos = {
      fecha: this.fechaGeneracion,
      periodo: this.periodoActual,
      kpis: this.kpis(),
      programas: this.analisisPorPrograma(),
      top10: this.top10CursosDemandados()
    };
    
    navigator.clipboard.writeText(JSON.stringify(datos, null, 2));
    alert('Datos copiados al portapapeles');
  }

}
