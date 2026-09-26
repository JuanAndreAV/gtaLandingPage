// src/app/services/academico/usuarios-admin.service.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { catchError, finalize, Observable, of, tap } from 'rxjs';
import { RegistroEstudianteCompleto } from '../../models/gestion-academica/registro-estudiante';

export interface PerfilEstudianteExtend {
  
  acudiente_nombre?: string;
  acudiente_telefono?: string;
  acudiente_parentesco?: string;
}

export interface VerificacionDocumento {
  existe: boolean;
  mensaje?: string;
  id?: string;
  nombre?: string;
  segundoNombre?: string;
  apellido?: string;
  segundoApellido?: string;
  email?: string | null;
  emailFicticio?: boolean;
  documento?: string;
  tipoIdentificacion?: string;
  
  
  fechaNacimiento?: string;
  telefono?: string;

  direccion?: string;
  barrio?: string; 
  pais?: string;

  departamento?: string;
      municipio?: string;
      departamentoNacimiento?: string;
      municipioNacimiento?: string;
      paisNacimiento?: string;
      enfoquePoblacional?: string;
      eps?: string;
      estrato?: number;
      genero?: string;
      zonaResidencia?: string;
      tieneDiscapacidad?: boolean;
      tipoDiscapacidad?: string;

  roles?: string[];
  activo?: boolean;
  camposFaltantes?: string[];
  perfilCompleto?: boolean;
  perfil?: PerfilEstudianteExtend | null;
}
/*
existe: true,
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.emailFicticio ? null : usuario.email,
      emailFicticio: usuario.emailFicticio,
      documento: usuario.documento,
      tipoIdentificacion: usuario.tipoIdentificacion,
      fechaNacimiento: usuario.fechaNacimiento,
      telefono: usuario.telefono,
      roles: usuario.roles,
      activo: usuario.activo,
      perfil: perfilExtendido ?? null,
      camposFaltantes,
      perfilCompleto: camposFaltantes.length === 0,
*/

// Representa la respuesta real devuelta por UsuariosService.crear() en NestJS
export interface RegistroUsuarioResponse {
  mensaje: string;
  usuario: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    emailFicticio: boolean;
    documento: string;
    tipoIdentificacion?: string;
    roles: string[];
    activo: boolean;
  };
}

@Injectable({ providedIn: 'root' })
export class UsuariosAdminService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.baseUrl}/usuarios`;

  verificado = signal<VerificacionDocumento | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  /**
   * Consulta el backend para verificar si el usuario o su perfil extendido existen.
   */
  verificarDocumento(documento: string): Observable<VerificacionDocumento> {
    this.isLoading.set(true);
    this.error.set(null);
    return this.http.get<VerificacionDocumento>(`${this.apiUrl}/verificar/${documento}`).pipe(
      tap((data) => {
        console.log(data)
        this.verificado.set(data)
         
      }),
  
      catchError((err) => {
        this.error.set(err.error?.message ?? 'Error al verificar el documento');
        return of({ existe: false });
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  /**
   * Actualiza el perfil en public.users y perfiles_estudiante
   */
  completarPerfil(id: string, datos: Partial<RegistroEstudianteCompleto>): Observable<{ mensaje: string }> {
    return this.http.put<{ mensaje: string }>(`${this.apiUrl}/${id}/completar-perfil`, datos);
  }

  /**
   * Registra un estudiante completo consumo directo del endpoint POST /usuarios/crear (o el equivalente administrativo)
   */
  registrarEstudianteCompleto(datos: Partial<RegistroEstudianteCompleto> | any): Observable<RegistroUsuarioResponse> {
    return this.http.post<RegistroUsuarioResponse>(`${this.apiUrl}/crear`, datos);
  }
}