// src/app/models/inscripcion.ts
export enum EstadoInscripcion {
  PENDIENTE = 'pendiente',
  ACTIVA = 'activa',
  RETIRADA = 'retirada',
  SUSPENDIDA = 'suspendida',
  FINALIZADA = 'finalizada',
  EN_ESPERA = 'en_espera',
}

export interface Inscripcion {
  id: string;
  usuarioId: string;
  cursoId: string;
  fechaInscripcion: string;
  estado: EstadoInscripcion;
  observaciones: string | null;
  createdAt: string;
  updatedAt: string;
  usuario?: { id: string; nombre: string; apellido: string; documento: string | null; email: string };
  curso?: { id: string; nombre: string; docenteId: string | null; asignatura?: { nombre: string } };
}

export interface CreateInscripcionDto {
  usuarioId: string;
  cursoId: string;
  observaciones?: string;
}

export interface CambiarEstadoDto {
  estado: EstadoInscripcion;
  observaciones?: string;
}