// src/app/services/academico/usuarios-admin.service.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, switchMap } from 'rxjs';
import { RegistroEstudianteCompleto } from '../../models/gestion-academica/registro-estudiante';

export interface VerificacionUsuario {
  existe: boolean;
  mensaje?: string;
  id?: string;
  nombre?: string;
  apellido?: string;
  email?: string | null;
  emailFicticio?: boolean;
  documento?: string;
  fechaNacimiento?: string;
  telefono?: string;
  activo?: boolean;
  camposFaltantes?: string[];
  perfilCompleto?: boolean;
}

export interface RegistrarUsuarioDto {
  email?: string;
  password: string;
  nombre: string;
  apellido: string;
  documento?: string;
  tipoIdentificacion?: string;
  segundoNombre?: string;
  segundoApellido?: string;
  telefono?: string;
  role?: ('admin' | 'docente' | 'estudiante')[];
}

export interface RegistroResponse {
  access_token: string | null;
  user: {
    id: string;
    email: string;
    emailFicticio: boolean;
    nombre: string;
    apellido: string;
    role: string;
  };
}

@Injectable({ providedIn: 'root' })
export class UsuariosAdminService {
  private http = inject(HttpClient);
  private apiUrl = environment.baseUrl;

  verificarDocumento(documento: string): Observable<VerificacionUsuario> {
    return this.http.get<VerificacionUsuario>(`${this.apiUrl}/usuarios/verificar/${documento}`);
  }

  registrar(dto: RegistrarUsuarioDto): Observable<RegistroResponse> {
    return this.http.post<RegistroResponse>(`${this.apiUrl}/usuarios/crear`, dto);
  }

  completarPerfil(usuarioId: string, dto: Partial<RegistroEstudianteCompleto>): Observable<{ mensaje: string }> {
    return this.http.put<{ mensaje: string }>(`${this.apiUrl}/usuarios/${usuarioId}/completar-perfil`, dto);
  }

  registrarEstudianteCompleto(datos: RegistroEstudianteCompleto): Observable<{ mensaje: string }> {
  const {
    nombre, apellido, documento, password, email,
    tipoIdentificacion, segundoNombre, segundoApellido, telefono,
    ...perfil
  } = datos;

  return this.registrar({
    nombre, apellido, documento, password, email,
    tipoIdentificacion, segundoNombre, segundoApellido, telefono,
    role: ['estudiante'],
  }).pipe(
    switchMap((res) => this.completarPerfil(res.user.id, perfil))
  );
}
}