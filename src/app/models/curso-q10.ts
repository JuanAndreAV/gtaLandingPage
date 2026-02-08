export interface CursoQ10 {
    Consecutivo:                             number;
    Codigo:                                  string;
    Nombre:                                  string;
    Codigo_docente:                          string;
    Abreviatura_tipo_identificacion_docente: string;
    Numero_identificacion_docente:           string;
    Nombre_docente:                          string;
    Consecutivo_sede_jornada:                number;
    Nombre_sede_jornada:                     string;
    Codigo_programa:                         string;
    Nombre_programa:                         string;
    Consecutivo_pensum_programa:             number;
    Nombre_pensum_programa:                  string;
    Codigo_asignatura:                       string;
    Nombre_asignatura:                       string;
    Cupo_maximo:                             number;
    Cantidad_estudiantes_matriculados:       number;
    Consecutivo_periodo:                     number;
    Nombre_periodo:                          string;
    Fecha_inicio:                            Date;
    Fecha_fin:                               Date;
    Estado:                                  string;
    Aplica_matricula_en_linea:               boolean;
    Consecutivo_descuento:                   null;
    Nombre_descuento:                        null;
    Fecha_inicio_descuento:                  null;
    Fecha_fin_descuento:                     null;
    Docentes_apoyo:                          any[];
}


