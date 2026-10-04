// src/app/models/asignatura.ts
export interface PensumItem {
  id: string;
  programaId: string;
  asignaturaId: string;
  obligatoria: boolean;
  orden: number | null;
  programa?: { id: string; nombre: string; colorHex: string | null };
}

export interface PensumItemDto {
  programaId: string;
  obligatoria?: boolean;
  orden?: number;
}

export interface Asignatura {
  id: string;
  docenteId: string | null;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  pensum?: PensumItem[];
}

export interface CreateAsignaturaDto {
  nombre: string;
  descripcion?: string;
  programas?: PensumItemDto[];
}

export type UpdateAsignaturaDto = Partial<CreateAsignaturaDto>;