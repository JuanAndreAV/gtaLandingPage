export interface Aulas {
    // src/app/models/aula.ts

  id: string;
  nombre: string;
  capacidad: number | null;
  descripcion: string | null;
  activo: boolean;
  createdAt: string;
}

export interface CreateAulaDto {
  nombre: string;
  capacidad?: number | null;
  descripcion?: string | null;
}

export type UpdateAulaDto = Partial<CreateAulaDto>;
