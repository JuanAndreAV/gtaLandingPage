export interface PoblacionQ10 {
    Codigo_estudiante:               string;
    Codigo_tipo_identificacion:      string;
    Abreviatura_tipo_identificacion: string;
    Nombre_tipo_identificacion:      string;
    Numero_identificacion:           string;
    Primer_nombre:                   string;
    Segundo_nombre:                  string;
    Primer_apellido:                 string;
    Segundo_apellido:                string;
    Fecha_nacimiento:                Date;
    Codigo_pais_nacimiento?:          null;
    Nombre_pais_nacimiento?:          null;
    Codigo_departamento_nacimiento?:  null;
    Nombre_departamento_nacimiento?:  null;
    Codigo_municipio_nacimiento?:     null;
    Nombre_municipio_nacimiento?:     null;
    Telefono?:                        string;
    Celular?:                         string;
    Email?:                           string;
    Direccion?:                       string;
    Codigo_pais_residencia?:          string;
    Nombre_pais_residencia?:          string;
    Codigo_departamento_residencia?:  string;
    Nombre_departamento_residencia?:  string;
    Codigo_municipio_residencia?:     string;
    Nombre_municipio_residencia?:     string;
    Codigo_barrio?:                   string;
    Nombre_barrio?:                   string;
    Codigo_genero?:                   string;
    Genero?:                          string;
    Edad?:                            number;
    Usuario:                         string;
    Ultima_fecha_actualizacion:      Date;
    Informacion_adicional?:           any[];
    Informacion_matricula:           InformacionMatricula[];
    Informacion_academica?:           any[];
    Informacion_laboral?:             any[];
    Preguntas_personalizadas?:        PreguntasPersonalizadas[];
    Familiares?:                      any[];
}

export interface InformacionMatricula {
    Codigo_matricula:           string;
    Fecha_matricula:            Date;
    Fecha_renovacion:           null;
    Codigo_condicion_matricula: null;
    Condicion_matricula:        null;
    Codigo_programa:            string;
    Nombre_programa:            string;
    Consecutivo_pensum:         number;
    Nombre_pensum:              string;
    Consecutivo_periodo:        number;
    Nombre_periodo:             string;
    Formalizada:                boolean;
    Codigo_sede:                string;
    Nombre_sede:                string;
    Codigo_jornada:             string;
    Nombre_jornada:             string;
    Codigo_nivel:               string;
    Nombre_nivel:               string;
    Consecutivo_grupo:          null;
    Codigo_grupo:               null;
    Nombre_grupo:               null;
    Estado_matricula:           string;
}
export interface RespuestaPregunta {
    Consecutivo_respuesta: number;
    Respuesta: string;
}
export interface Pregunta{
    Consecutivo_pregunta: number;
    Pregunta: string;
    Respuesta: RespuestaPregunta[];
}

export interface PreguntasPersonalizadas {
    Preguntas_personalizadas: Pregunta[];
           
}