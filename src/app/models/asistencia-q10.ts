export interface AsistenciaQ10 {
    Consecutivo_curso:                       number;
    Nombre_curso:                            string;
    Abreviatura_tipo_identificacion_docente: string;
    Numero_identificacion_docente:           string;
    Nombre_completo_docente:                 string;
    Codigo_asignatura:                       string;
    Nombre_asignatura:                       string;
    Codigo_programa:                         string;
    Nombre_programa:                         string;
    Consecutivo_periodo:                     number;
    Nombre_periodo:                          string;
    Consecutivo_sede_jornada:                number;
    Nombre_sede_jornada:                     string;
    Estudiantes:                             Estudiante[];
}



export interface Estudiante {
    Codigo_matricula:                           string;
    Abreviatura_tipo_identificacion_estudiante: string;
    Numero_identificacion_estudiante:           string;
    Nombre_completo_estudiante:                 string;
    Promedio_evaluacion:                        number;
    Porcentaje_evaluado:                        number;
    Cantidad_inasistencia:                      number;
    Porcentaje_inasistencia:                    number;
    Estudiante_formalizado:                     string;
    Observaciones:                              null;
    Parametros_evaluacion:                      any[];
}



