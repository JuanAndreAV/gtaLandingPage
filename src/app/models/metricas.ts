export interface MetricasAdmin {
  // General
  totalEstudiantes: number;
  estudiantesActivos: number;
  estudiantesNuevos: number; // último mes
  
  // Cursos
  totalCursos: number;
  cursosActivos: number;
  cursosMasPopulares: CursoMetrica[];
  
  // Profesores
  totalProfesores: number;
  profesoresActivos: number;
  
  // Inscripciones
  inscripcionesDelMes: number;
  inscripcionesPendientes: number;
  tasaDesercion: number; // %
  
  // Asistencia
  promedioAsistenciaGeneral: number; // %
  
  // Tendencias
  tendenciaInscripciones: TendenciaData[];
  distribucionPorCategoria: CategoriaData[];
}

export interface CursoMetrica {
  cursoId: string;
  nombre: string;
  inscritos: number;
  capacidad: number;
  porcentajeOcupacion: number;
  promedioAsistencia: number;
  categoria: string;
}

export interface TendenciaData {
  mes: string;
  inscripciones: number;
  deserciones: number;
}

export interface CategoriaData {
  categoria: string;
  cantidad: number;
  porcentaje: number;
}

export interface DesercionAnalisis {
  porPeriodo: {
    mes: string;
    cantidad: number;
    porcentaje: number;
  }[];
  porCurso: {
    cursoId: string;
    nombre: string;
    deserciones: number;
  }[];
  motivosPrincipales: {
    motivo: string;
    cantidad: number;
  }[];
}

export interface AsistenciaMetrica {
  cursoId: string;
  nombreCurso: string;
  totalClases: number;
  clasesRealizadas: number;
  promedioAsistencia: number;
  estudiantesEnRiesgo: number; // < 70%
}
