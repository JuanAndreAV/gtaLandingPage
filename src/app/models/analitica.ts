export interface Conteo {
  etiqueta: string;
  total: number;
}

export interface AnaliticaResumen {
  inscripciones: number;
  personas: number;
  activas: number;
  pendientes: number;
  en_espera: number;
  retiradas: number;
  tasaRetiro: number;
}

export interface Analitica {
  resumen: AnaliticaResumen;
  poblacion: {
    genero: Conteo[];
    cicloVida: Conteo[];
    estrato: Conteo[];
    zona: Conteo[];
    enfoque: Conteo[];
    discapacidad: Conteo[];
    barrios: Conteo[];
  };
  inscripciones: {
    porMes: { mes: string; total: number; retiradas: number }[];
    porEstado: Conteo[];
    porArea: Conteo[];
    ocupacion: { curso: string; inscritos: number; capacidad: number; porcentaje: number | null }[];
  };
}
