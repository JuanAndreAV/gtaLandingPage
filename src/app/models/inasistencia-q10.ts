export interface InasistenciaQ10 {
    Primer_nombre:                    string;
    Segundo_nombre:                   string;
    Primer_apellido:                  string;
    Segundo_apellido:                 string;
    Numero_identificacion_estudiante: string;
    Sexo:                             Sexo;
    Correo_electronico_personal:      string;
    Celular:                          string;
    Cursos:                           Curso[];
}

export interface Curso {
    Codigo_modulo:                 string;
    Nombre_modulo:                 string;
    Codigo_curso:                  string;
    Nombre_curso:                  string;
    Numero_identificacion_docente: string;
    Nombre_docente:                string;
    Horario_curso:                 string;
    Periodo_curso:                 string;
    Fecha_inicio:                  Date;
    Fecha_fin:                     Date;
    Cantidad_inasistencia:         number;
    Observaciones?:                 string | null;
    Inasistencias:                 Inasistencia[];
}

export interface Inasistencia {
    Dia:                   string;
    Fecha:                 string;
    Hora:                  string;
    Justificacion:         boolean;
    Detalle_justificacion?: string;
}

export enum DetalleJustificacion {
    CitaMédica = "Cita médica ",
    Empty = "",
    EstabaIncapacitadoPorUnaOperación = "Estaba incapacitado por una operación.",
    ExcusaMédica = "Excusa médica",
    NoAsistePorqueTeníaCitaMédicaEnMedellín = "No asiste porque tenía cita médica en Medellín.",
}



export enum Sexo {
    F = "F",
    M = "M",
}


