export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  role: 'admin' | 'profesor';
  createdAt: Date;
}

export interface CreateUsuarioDto {
  email: string;
  password: string;
  nombre: string;
  role: 'admin' | 'profesor';
}

export interface UpdateUsuarioDto {
  email?: string;
  nombre?: string;
  role?: 'admin' | 'profesor';
}