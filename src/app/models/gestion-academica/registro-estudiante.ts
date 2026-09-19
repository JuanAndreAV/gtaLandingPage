
export interface RegistroEstudianteCompleto {
  // Identidad — auth.register
  nombre: string;
  apellido: string;
  documento: string;
  password: string;
  email?: string;

  // public.users
  segundoNombre?: string;
  segundoApellido?: string;
  tipoIdentificacion?: string;
  telefono?: string;
  fechaNacimiento?: string;

  // perfiles_estudiante — ubicación actual
  direccion?: string;
  barrio?: string;
  municipio?: string;
  departamento?: string;
  pais?: string;

  // perfiles_estudiante — lugar de nacimiento
  municipioNacimiento?: string;
  departamentoNacimiento?: string;
  paisNacimiento?: string;

  // perfiles_estudiante — demográficos
  genero?: string;
  zonaResidencia?: string;
  enfoquePoblacional?: string;

  // perfiles_estudiante — salud
  tieneDiscapacidad?: boolean;
  tipoDiscapacidad?: string;
  estrato?: number;
  eps?: string;

  // perfiles_estudiante — acudiente
  acudienteNombre?: string;
  acudienteTelefono?: string;
  acudienteParentesco?: string;
}