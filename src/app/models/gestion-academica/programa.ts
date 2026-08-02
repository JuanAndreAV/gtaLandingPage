// src/app/models/programa.ts
export enum AreaArtistica {
  MUSICA = 'Música',
  DANZA = 'Danza',
  ARTES_PLASTICAS = 'Artes Plásticas',
  TEATRO = 'Teatro',
  LITERATURA = 'Literatura y Biblioteca',
  PRODUCCION = 'Producción',
  OTRO = 'Otro',
}

export interface Programa {
  id: string;
  nombre: string;
  descripcion: string | null;
  colorHex: string | null;
  area: AreaArtistica;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProgramaDto {
  nombre: string;
  area: AreaArtistica;
  descripcion?: string;
  colorHex?: string;
}

export type UpdateProgramaDto = Partial<CreateProgramaDto>;

export interface Periodo {
  id: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  activo: boolean;
  createdAt: string;
}

export interface CreatePeriodoDto {
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
}

export type UpdatePeriodoDto = Partial<CreatePeriodoDto>;