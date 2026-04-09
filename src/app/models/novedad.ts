export interface Novedad {
    nombreDocente: string;
    curso: string;
    tipoNovedad: 'cambio_horario' | 'incapacidad';
    motivo: string;
   
    notaCoordinador?: string;
    fechaOriginal?: string;
    nuevaFecha?: string;
    //incapacidad 
    fechaInicioIncapacidad?: string;
    fechaFinIncapacidad?: string;
}
export interface respuestaNovedad {
    _id:                    string;
    nombreDocente:          string;
    curso:                  string;
    tipoNovedad:            string;
    motivo?:                 string;
    estado:                 string;
    fechaOriginal?:          Date;
    nuevaFecha?:             Date;
    fechaInicioIncapacidad?: null;
    fechaFinIncapacidad?:    null;
    createdAt:              Date;
    updatedAt:              Date;
    __v:                    number;
    notaCoordinador?:        string;
}

