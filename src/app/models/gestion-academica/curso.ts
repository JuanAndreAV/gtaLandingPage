import { PerfilDocente } from "./docentes";

// src/app/models/curso.ts
export enum DiaSemana {
  LUNES = 'lunes',
  MARTES = 'martes',
  MIERCOLES = 'miercoles',
  JUEVES = 'jueves',
  VIERNES = 'viernes',
  SABADO = 'sabado',
  DOMINGO = 'domingo',
}

export interface Horario {
  id: string;
  cursoId: string;
  aulaId: string | null;
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFin: string;
  aula?: { id: string; nombre: string } | null;
}

export interface CreateHorarioDto {
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFin: string;
  aulaId?: string;
}

export interface Curso {
  id: string;
  asignaturaId: string;
  periodoId: string;
  docenteId: string | null;
  nombre: string;
  descripcion: string | null;
  capacidadMax: number;
  edadMin: number | null;
  edadMax: number | null;
  intensidadHoraria: number | null;
  porcentajeAsistenciaMin: number;
  notaAprobatoria: number;
  requiereNivelPrevio: boolean;
  cursoPrerequisitorId: string | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  asignatura?: { id: string; nombre: string };
  periodo?: { id: string; nombre: string };
  docente?: PerfilDocente | null;
  horarios?: Horario[];
  cursoPrerequisito?: { id: string; nombre: string } | null;
}

export interface CreateCursoDto {
  asignaturaId: string;
  periodoId: string;
  docenteId?: string | null;
  nombre: string;
  descripcion?: string;
  capacidadMax?: number;
  edadMin?: number;
  edadMax?: number;
  intensidadHoraria?: number;
  porcentajeAsistenciaMin?: number;
  notaAprobatoria?: number;
  requiereNivelPrevio?: boolean;
  cursoPrerequisitorId?: string;
  horarios?: CreateHorarioDto[];
}

export type UpdateCursoDto = Partial<CreateCursoDto>;