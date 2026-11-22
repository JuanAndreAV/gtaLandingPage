export type TipoEstudiante = 'nuevo' | 'antiguo';
export type EstadoOferta = 'pendiente' | 'aprobada' | 'rechazada' | 'devuelta';
export type DiaSemana = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';

export const DIAS: { valor: DiaSemana; etiqueta: string }[] = [
  { valor: 'lunes', etiqueta: 'Lunes' }, { valor: 'martes', etiqueta: 'Martes' },
  { valor: 'miercoles', etiqueta: 'Miércoles' }, { valor: 'jueves', etiqueta: 'Jueves' },
  { valor: 'viernes', etiqueta: 'Viernes' }, { valor: 'sabado', etiqueta: 'Sábado' },
  { valor: 'domingo', etiqueta: 'Domingo' },
];

export const ESTADOS_OFERTA: Record<EstadoOferta, { etiqueta: string; clase: string }> = {
  pendiente: { etiqueta: 'Pendiente', clase: 'bg-amber-50 text-amber-800 ring-amber-200' },
  aprobada:  { etiqueta: 'Aprobado',  clase: 'bg-emerald-50 text-emerald-800 ring-emerald-200' },
  rechazada: { etiqueta: 'Rechazado', clase: 'bg-red-50 text-red-700 ring-red-200' },
  devuelta:  { etiqueta: 'Devuelto para corregir', clase: 'bg-sky-50 text-sky-800 ring-sky-200' },
};

export interface HorarioOferta {
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFin: string;
}

export interface CursoOfertaDatos {
  tipoEstudiante: TipoEstudiante;
  nivelNumero: number;
  nombre: string;
  descripcion: string | null;
  areaSugerida: string | null;
  asignaturaSugerida: string | null;
  edadMin: number | null;
  edadMax: number | null;
  capacidadMax: number;
  intensidadHoraria: number | null;
  horarios: HorarioOferta[];
  observaciones: string | null;
}

export interface OfertaCurso extends CursoOfertaDatos {
  id: string;
  docenteId: string;
  periodoId: string;
  cargaId: string;
  archivoNombre: string | null;
  estado: EstadoOferta;
  observacionRevision: string | null;
  revisadoEn: string | null;
  cursoId: string | null;
  createdAt: string;
  updatedAt: string;
  periodo?: { id: string; nombre: string };
  docente?: { id: string; nombre: string | null; apellido: string | null; email: string };
  revisor?: { id: string; nombre: string | null; apellido: string | null } | null;
  curso?: {
    id: string;
    nombre: string;
    asignatura?: { id: string; nombre: string };
    nivel?: { id: string; nombre: string; orden: number } | null;
    horarios?: { aula?: { nombre: string } | null }[];
  } | null;
}

export interface FilaOfertaLeida {
  fila: number;
  curso: Partial<CursoOfertaDatos>;
  errores: string[];
}

export interface PrevisualizacionOferta {
  filas: FilaOfertaLeida[];
  validas: number;
  conErrores: number;
}

export interface Nivel {
  id: string;
  asignaturaId: string;
  orden: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  cursos?: number;
}
