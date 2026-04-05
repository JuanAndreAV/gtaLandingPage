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
