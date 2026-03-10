// q10-poblacion.component.ts
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Q10PoblacionService } from '../../services/academico/q10-poblacion.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PoblacionQ10, Pregunta } from '../../models/poblacion-q10';

@Component({
  selector: 'app-q10-poblacion',
  imports: [CommonModule, FormsModule],
  templateUrl: './q10-poblacion.component.html',
  styleUrl: './q10-poblacion.component.css',
})
export class Q10PoblacionComponent implements OnInit {
  public poblacionQ10 = inject(Q10PoblacionService);
  public filtroProgramas = '';

  ngOnInit() {
    this.poblacionQ10.obtenerPoblacionQ10(0).subscribe();
  }

  private get estudiantes(): PoblacionQ10[] {
    return this.poblacionQ10.poblacionQ10() ?? [];
  }

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
    for (const e of this.estudiantes) {
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
      { rango: '0 - 5',    min: 0,  max: 5,  color: '#818cf8', cantidad: 0, porcentaje: 0 },
      { rango: '6 – 11', min: 6, max: 11,  color: '#38bdf8', cantidad: 0, porcentaje: 0  },
      { rango: '12 – 17', min: 12, max: 17,  color: '#34d399', cantidad: 0, porcentaje: 0  },
      { rango: '18 – 28', min: 18, max: 28,  color: '#fbbf24', cantidad: 0, porcentaje: 0  },
      { rango: '29 – 59', min: 29, max: 59,  color: '#f97316', cantidad: 0, porcentaje: 0  },
      { rango: '> 60',    min: 60, max: 999, color: '#f472b6', cantidad: 0, porcentaje: 0  },
    ];
    for (const e of this.estudiantes) {
      if (e.Edad == null) continue;
      const g = grupos.find(g => e.Edad! >= g.min && e.Edad! <= g.max);
      if (g){
        g.cantidad++;
        g.porcentaje = this.totalEstudiantes() ? +(g.cantidad / this.totalEstudiantes() * 100).toFixed(1) : 0;
      } 
     
    }
    return grupos;
  });

  maxGrupoEdad = computed(() => Math.max(...this.gruposEdad().map(g => g.cantidad), 1));

  // ── Programas ─────────────────────────────────────────────────────────────

  programas = computed(() => {
    const mapa = new Map<string, { nombre: string; cantidad: number; nivel: string; sede: string; jornada: string }>();
    for (const e of this.estudiantes) {
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

  topProgramas = computed(() => this.programas().slice(0, 10));

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
    for (const e of this.estudiantes) {
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
   * El JSON real tiene Preguntas_personalizadas como Pregunta[] directo en el estudiante.
   * Busca por texto de pregunta (case-insensitive) y retorna la primera respuesta.
   */
  private respuestaPregunta(estudiante: PoblacionQ10, textoPregunta: string): string | null {
    const preguntas = estudiante.Preguntas_personalizadas as unknown as Pregunta[] | undefined;
    if (!preguntas?.length) return null;
    const encontrada = preguntas.find(p =>
      p.Pregunta?.toLowerCase().includes(textoPregunta.toLowerCase())
    );
    return encontrada?.Respuesta?.[0]?.Respuesta ?? null;
  }

  // ── Zona de residencia ────────────────────────────────────────────────────

  zonaResidencia = computed(() => {
    const mapa: Record<string, number> = {};
    for (const e of this.estudiantes) {
      const raw = this.respuestaPregunta(e, 'zona de residencia');
      const r = raw?.trim() || 'No especificado';
      if (raw !== null && raw.trim() === '') {
        console.log('Zona vacía en estudiante:', e.Codigo_estudiante, '| raw:', JSON.stringify(raw));
      }
      mapa[r] = (mapa[r] ?? 0) + 1;
    }
    console.table(Object.entries(mapa).map(([zona, cantidad]) => ({ zona, cantidad })));
    return Object.entries(mapa)
      .map(([zona, cantidad]) => ({ zona, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);
  });

  pctZona = (cantidad: number) =>
    this.totalEstudiantes() ? +(cantidad / this.totalEstudiantes() * 100).toFixed(1) : 0;

  // ── Enfoque poblacional ───────────────────────────────────────────────────

  enfoquePoblacional = computed(() => {
    const mapa: Record<string, number> = {};
    for (const e of this.estudiantes) {
      const raw = this.respuestaPregunta(e, 'enfoque poblacional');
      const r = raw?.trim() || 'No especificado';
      if (raw !== null && raw.trim() === '') {
        console.log('Enfoque vacío en estudiante:', e.Codigo_estudiante, '| raw:', JSON.stringify(raw));
      }
      mapa[r] = (mapa[r] ?? 0) + 1;
    }
    console.log('--- Enfoque poblacional raw values ---');
    console.table(Object.entries(mapa).map(([enfoque, cantidad]) => ({ enfoque, cantidad })));
    return Object.entries(mapa)
      .map(([enfoque, cantidad]) => ({ enfoque, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);
  });

  estudiantesConEnfoque = computed(() =>
    this.enfoquePoblacional()
      .filter(e => !/no aplica/i.test(e.enfoque))
      .reduce((acc, e) => acc + e.cantidad, 0)
  );

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