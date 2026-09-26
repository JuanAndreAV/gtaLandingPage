
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

  
  direccion?: string;
  barrio?: string;
  municipio?: string;
  departamento?: string;
  pais?: string;


  municipioNacimiento?: string;
  departamentoNacimiento?: string;
  paisNacimiento?: string;

  
  genero?: string;
  zonaResidencia?: string;
  enfoquePoblacional?: string;

  
  tieneDiscapacidad?: boolean;
  tipoDiscapacidad?: string;
  estrato?: number;
  eps?: string;

  // perfiles_estudiante — acudiente
  acudienteNombre?: string;
  acudienteTelefono?: string;
  acudienteParentesco?: string;
}