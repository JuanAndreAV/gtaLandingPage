// q10-poblacion.component.ts
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Q10PoblacionService } from '../../services/academico/q10-poblacion.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PoblacionQ10, Pregunta } from '../../models/poblacion-q10';
import { TitleComponent } from '../../shared/components/title/title.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { FilterComponent } from '../../shared/components/filter/filter.component';

@Component({
  selector: 'app-q10-poblacion',
  imports: [CommonModule, FormsModule, TitleComponent, SpinnerComponent, FilterComponent],
  templateUrl: './q10-poblacion.component.html',
  styleUrl: './q10-poblacion.component.css',
})
export class Q10PoblacionComponent implements OnInit {
  public poblacionQ10 = inject(Q10PoblacionService);
  public grupoEdadSeleccionado = signal<string>('');
  public filtroProgramas = '';
  //public estudiantesSeleccionados = signal<PoblacionQ10[]>([]);

  ngOnInit() {
    this.poblacionQ10.obtenerPoblacionQ10(0).subscribe();
    console.log(this.datosParaInforme());
   
   
  }

  private get estudiantes(): PoblacionQ10[] {
    return this.poblacionQ10.poblacionQ10() ?? [];
  }
    rangosEdad = [
    { val: '0-5', label: '0-5 años' },
    { val: '6-13', label: '6-13 años' },
    { val: '14-28', label: '14-28 años' },
    { val: '29-59', label: '29-59 años' },
    { val: '>60', label: '60+ años' },
    { val: '', label: 'Todos' },
    ]

    


   estudiantesActivos = computed(() => {
  const rango = this.grupoEdadSeleccionado();
  if (!rango) return this.estudiantes;
  return this.estudiantes.filter(e => {
    if (e.Edad == null) return false;
    if (rango === '0-5')   return e.Edad <= 5;
    if (rango === '6-13')  return e.Edad >= 6  && e.Edad <= 13;
    if (rango === '14-28') return e.Edad >= 14 && e.Edad <= 28;
    if (rango === '29-59') return e.Edad >= 29 && e.Edad <= 59;
    if (rango === '>60')   return e.Edad >= 60;
    return true;
  });
});
filtroEdad(item: { val: string }): void {
  this.grupoEdadSeleccionado.set(item.val);
}

   /*estudiantesPorRangoEdad(rango?: string): PoblacionQ10[] {

    const grupos: Record<string, PoblacionQ10[]> = {
      '0-5': [],
      '6-13': [],
      '14-28': [],
      '29-59': [],
      '60+': []
    };
   
    for (const e of this.estudiantes) {
      if (e.Edad == null) continue;
      if (e.Edad <= 5) grupos['0-5'].push(e);
      else if (e.Edad <= 13) grupos['6-13'].push(e);
      else if (e.Edad <= 28) grupos['14-28'].push(e);
      else if (e.Edad <= 59) grupos['29-59'].push(e);
      else grupos['60+'].push(e);
    }
    return rango ? grupos[rango] : this.estudiantes;
  }*/

  // ── KPIs ─────────────────────────────────────────────────────────────────

  totalEstudiantes = computed(() => this.estudiantes.length);

  edadPromedio = computed(() => {
    const edades = this.estudiantes.map(e => e.Edad).filter((e): e is number => e != null);
    if (!edades.length) return '—';
    return (edades.reduce((a, b) => a + b, 0) / edades.length).toFixed(1);
  });

  totalMunicipios = computed(() => {
    const set = new Set(this.estudiantes.map(e => e.Nombre_municipio_residencia).filter(Boolean));
    return set.size;
  });

  // ── Género ────────────────────────────────────────────────────────────────

  private conteoGenero = computed(() => {
    const mapa: Record<string, number> = {};
    for (const e of this.estudiantesActivos() ) {
      const g = e.Genero ?? e.Codigo_genero ?? 'No especificado';
      mapa[g] = (mapa[g] ?? 0) + 1;
    }
    return mapa;
  });

  conteoGeneroArray = computed(() =>
    Object.entries(this.conteoGenero())
      .map(([genero, cantidad]) => ({ genero, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
  );

  private generoCount(keys: string[]): number {
    const mapa = this.conteoGenero();
    return keys.reduce((acc, k) => acc + (mapa[k] ?? 0), 0);
  }

  porcentajeMujeres = computed(() => {
    const n = this.generoCount(['F', 'Femenino', 'FEMENINO', 'Mujer', 'MUJER']);
    return this.totalEstudiantes() ? +(n / this.totalEstudiantes() * 100).toFixed(1) : 0;
  });

  porcentajeHombres = computed(() => {
    const n = this.generoCount(['M', 'Masculino', 'MASCULINO', 'Hombre', 'HOMBRE']);
    return this.totalEstudiantes() ? +(n / this.totalEstudiantes() * 100).toFixed(1) : 0;
  });

  // ── Edad ──────────────────────────────────────────────────────────────────

  gruposEdad = computed(() => {
    const grupos = [
      { rango: '0-5',    min: 0,  max: 5,  color: '#818cf8', cantidad: 0 },
      { rango: '6-13', min: 6, max: 13,  color: '#38bdf8', cantidad: 0  },
      { rango: '14-28', min: 14, max: 28,  color: '#34d399', cantidad: 0  },
      { rango: '29-59', min: 29, max: 59,  color: '#f97316', cantidad: 0  },
      { rango: '>60',    min: 60, max: 999, color: '#f472b6', cantidad: 0  },
    ];
    for (const e of this.estudiantes) {
      if (e.Edad == null) continue;
      const g = grupos.find(g => e.Edad! >= g.min && e.Edad! <= g.max);
      if (g) g.cantidad++;
    }
    return grupos;
  });

  maxGrupoEdad = computed(() => Math.max(...this.gruposEdad().map(g => g.cantidad), 1));

  // ── Programas ─────────────────────────────────────────────────────────────

  programas = computed(() => {
    const mapa = new Map<string, { nombre: string; cantidad: number; nivel: string; sede: string; jornada: string }>();
    for (const e of this.estudiantesActivos()) {
      for (const m of e.Informacion_matricula ?? []) {
        const key = m.Codigo_programa;
        if (!mapa.has(key)) {
          mapa.set(key, { nombre: m.Nombre_programa, cantidad: 0, nivel: m.Nombre_nivel, sede: m.Nombre_sede, jornada: m.Nombre_jornada });
        }
        mapa.get(key)!.cantidad++;
      }
    }
    return [...mapa.values()].sort((a, b) => b.cantidad - a.cantidad);
  });

  topProgramas = computed(() => this.programas().slice(0, 15));

  programasFiltrados = computed(() => {
    const f = this.filtroProgramas.toLowerCase();
    return f ? this.programas().filter(p => p.nombre.toLowerCase().includes(f)) : this.programas();
  });

  // ── Municipios ────────────────────────────────────────────────────────────

  topMunicipios = computed(() => {
    const mapa: Record<string, number> = {};
    for (const e of this.estudiantes) {
      const m = e.Nombre_municipio_residencia ?? 'No especificado';
      mapa[m] = (mapa[m] ?? 0) + 1;
    }
    return Object.entries(mapa)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 8);
  });

  // ── Tipos de identificación ───────────────────────────────────────────────

  tiposIdentificacion = computed(() => {
    const mapa = new Map<string, { abreviatura: string; nombre: string; cantidad: number }>();
    for (const e of this.estudiantesActivos()) {
      const key = e.Codigo_tipo_identificacion;
      if (!mapa.has(key)) {
        mapa.set(key, { abreviatura: e.Abreviatura_tipo_identificacion, nombre: e.Nombre_tipo_identificacion, cantidad: 0 });
      }
      mapa.get(key)!.cantidad++;
    }
    return [...mapa.values()].sort((a, b) => b.cantidad - a.cantidad);
  });

  // ── Preguntas personalizadas (helper) ────────────────────────────────────

  /**
   * Patrón de dirección urbana: cra, carrera, calle, cl, avenida, av,
   * diagonal, diag, transversal, tv — seguidas de número o #
   */
  private readonly REGEX_DIR_URBANA = /^(cra|carrera|calle|cl|barrio|avenida|av|diagonal|diag|transversal|tv)\s*[0-9#]/i;

  /**
   * Busca la respuesta de una pregunta personalizada por texto (case-insensitive).
   * Para preguntas de zona de residencia, si no hay respuesta aplica fallback:
   *   - Dirección con patrón urbano → "Urbana"
   *   - Sin dirección reconocible   → "Rural"
   */
  private respuestaPregunta(estudiante: PoblacionQ10, textoPregunta: string): string | null {
    const preguntas = estudiante.Preguntas_personalizadas as unknown as Pregunta[] | undefined;

    if (preguntas?.length) {
      const encontrada = preguntas.find(p =>
        p.Pregunta?.toLowerCase().includes(textoPregunta.toLowerCase())
      );
      const respuesta = encontrada?.Respuesta?.[0]?.Respuesta?.trim() ?? null;
      if (respuesta) return respuesta;
    }

    // Fallback solo para zona de residencia
    if (textoPregunta.toLowerCase().includes('zona')) {
      return this.REGEX_DIR_URBANA.test(estudiante.Direccion?.trim() ?? '')
        ? 'Urbana'
        : 'Rural';
    }

    return null;
  }

  // ── Zona de residencia ────────────────────────────────────────────────────

  zonaResidencia = computed(() => {
    const mapa: Record<string, number> = {};
    for (const e of this.estudiantesActivos()) {
      const r = this.respuestaPregunta(e, 'zona de residencia') ?? 'No especificado';
      mapa[r] = (mapa[r] ?? 0) + 1;
    }
    return Object.entries(mapa)
      .map(([zona, cantidad]) => ({ zona, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);
  });

  pctZona = (cantidad: number) =>
    this.totalEstudiantes() ? +(cantidad / this.totalEstudiantes() * 100).toFixed(1) : 0;

  // ── Enfoque poblacional ───────────────────────────────────────────────────

  enfoquePoblacional = computed(() => {
    const mapa: Record<string, number> = {};
    for (const e of this.estudiantesActivos()) {
      const r = this.respuestaPregunta(e, 'enfoque poblacional') ?? 'No especificado';
      mapa[r] = (mapa[r] ?? 0) + 1;
    }
    return Object.entries(mapa)
      .map(([enfoque, cantidad]) => ({ enfoque, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);
  });

  estudiantesConEnfoque = computed(() =>
    this.enfoquePoblacional()
      .filter(e => !/no aplica/i.test(e.enfoque))
      .reduce((acc, e) => acc + e.cantidad, 0)
  );
// Helper para buscar respuestas en las preguntas personalizadas de Q10
private obtenerRespuestaPersonalizada(estudiante: any, nombrePregunta: string): string {
  const pregunta = estudiante.Preguntas_personalizadas?.find(
    (p: any) => p.Pregunta.trim().toLowerCase() === nombrePregunta.toLowerCase()
  );
  return pregunta?.Respuesta?.[0]?.Respuesta ?? 'No especificado';
}

// 1. Filtrar solo los estudiantes que son víctimas
victimasDelConflicto = computed(() => {
  return this.estudiantesActivos().filter(e => {
    const enfoque = this.obtenerRespuestaPersonalizada(e, 'enfoque poblacional');
    return /víctima/i.test(enfoque);
  });
});

// 2. Extraer el set de datos listos para el análisis (Edad y Zona)
datosParaInforme = computed(() => {
  return this.victimasDelConflicto().map(e => ({
    codigo: e.Codigo_estudiante,
    Nombre: `${e.Primer_nombre} ${e.Segundo_nombre} ${e.Primer_apellido} ${e.Segundo_apellido}`.replace(/\s+/g, ' ').trim(),
    tipoIdentificacion: e.Nombre_tipo_identificacion,
    Identificacion: e.Numero_identificacion,
    edad: e.Edad,
    celular: e.Celular,
    email: e.Email,
    Direccion: e.Direccion,
    programa: e.Informacion_matricula?.[0]?.Nombre_programa ?? 'No especificado'
  }));
});
  // ── Estado de matrícula ───────────────────────────────────────────────────

  estadosMatricula = computed(() => {
    const mapa: Record<string, number> = {};
    for (const e of this.estudiantes) {
      for (const m of e.Informacion_matricula ?? []) {
        const estado = m.Estado_matricula ?? 'Desconocido';
        mapa[estado] = (mapa[estado] ?? 0) + 1;
      }
    }
    return Object.entries(mapa)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);
  });

  esActivo   = (e: string) => /activ|formal/i.test(e);
  esRetirado = (e: string) => /retir|cancel|baja/i.test(e);
  esGraduado = (e: string) => /grad|egres/i.test(e);
  esOtro     = (e: string) => !this.esActivo(e) && !this.esRetirado(e) && !this.esGraduado(e);
}