import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  AsistenciasService, MOTIVOS_NO_REALIZADA, MotivoNoRealizada, SeguimientoAsistencia, SeguimientoCurso,
} from '../../../../services/gestion-academica/asistencias.service';
import { ProgramasService } from '../../../../services/gestion-academica/programas.service';
import { Periodo } from '../../../../models/gestion-academica/programa';

interface FilaDocente {
  id: string;
  nombre: string;
  email: string | null;
  telefono: string | null;
  cursos: SeguimientoCurso[];
  esperadas: number;
  registradas: number;
  faltantes: number;
  ultimaFecha: string | null;
  cumplimiento: number | null;
}

const SIN_DOCENTE = 'sin-docente';

@Component({
  selector: 'app-seguimiento-asistencia',
  imports: [RouterLink],
  templateUrl: './seguimiento-asistencia.component.html',
})
export class SeguimientoAsistenciaComponent implements OnInit {
  private asistenciasService = inject(AsistenciasService);
  private programasService = inject(ProgramasService);

  periodos = signal<Periodo[]>([]);
  periodoId = signal('');
  datos = signal<SeguimientoAsistencia | null>(null);
  cargando = signal(false);
  error = signal<string | null>(null);
  busqueda = signal('');
  soloPendientes = signal(true);
  abiertos = signal<Set<string>>(new Set());

  // ── Receso general (vacaciones para todos los cursos) ──
  readonly motivos = MOTIVOS_NO_REALIZADA;
  receso = signal<{ desde: string; hasta: string; motivo: MotivoNoRealizada; observacion: string } | null>(null);
  guardandoReceso = signal(false);
  mensajeReceso = signal<string | null>(null);

  readonly docentes = computed<FilaDocente[]>(() => {
    const mapa = new Map<string, FilaDocente>();
    for (const c of this.datos()?.cursos ?? []) {
      const id = c.docente?.id ?? SIN_DOCENTE;
      if (!mapa.has(id)) {
        mapa.set(id, {
          id, nombre: c.docente?.nombre ?? 'Sin docente asignado', email: c.docente?.email ?? null,
          telefono: c.docente?.telefono ?? null, cursos: [], esperadas: 0, registradas: 0, faltantes: 0,
          ultimaFecha: null, cumplimiento: null,
        });
      }
      const d = mapa.get(id)!;
      d.cursos.push(c);
      d.esperadas += c.esperadas;
      d.registradas += c.registradas;
      d.faltantes += c.faltantes.length;
      if (c.ultimaFecha && (!d.ultimaFecha || c.ultimaFecha > d.ultimaFecha)) d.ultimaFecha = c.ultimaFecha;
    }
    for (const d of mapa.values()) {
      d.cumplimiento = d.esperadas ? Math.round((d.registradas / d.esperadas) * 1000) / 10 : null;
      d.cursos.sort((a, b) => b.faltantes.length - a.faltantes.length);
    }
    return [...mapa.values()].sort((a, b) => b.faltantes - a.faltantes || a.nombre.localeCompare(b.nombre, 'es'));
  });

  readonly filtrados = computed(() => {
    const q = this.normalizar(this.busqueda().trim());
    return this.docentes().filter((d) => {
      if (this.soloPendientes() && d.faltantes === 0) return false;
      if (!q) return true;
      return this.normalizar(`${d.nombre} ${d.email ?? ''} ${d.cursos.map((c) => `${c.curso} ${c.asignatura ?? ''}`).join(' ')}`).includes(q);
    });
  });

  readonly resumen = computed(() => {
    const cursos = (this.datos()?.cursos ?? []).filter((c) => c.esperadas > 0);
    const esperadas = cursos.reduce((s, c) => s + c.esperadas, 0);
    const registradas = cursos.reduce((s, c) => s + c.registradas, 0);
    return {
      cumplimiento: esperadas ? Math.round((registradas / esperadas) * 1000) / 10 : null,
      faltantes: esperadas - registradas,
      cursosPendientes: cursos.filter((c) => c.faltantes.length).length,
      cursosTotal: cursos.length,
      docentesPendientes: this.docentes().filter((d) => d.faltantes > 0 && d.id !== SIN_DOCENTE).length,
      sinDocente: (this.datos()?.cursos ?? []).filter((c) => !c.docente).length,
      sinHorario: (this.datos()?.cursos ?? []).filter((c) => !c.dias.length).length,
    };
  });

  ngOnInit(): void {
    this.programasService.listarPeriodos().subscribe((periodos) => {
      this.periodos.set(periodos);
      const actual = periodos.find((p) => p.activo) ?? periodos[0];
      if (actual) this.cambiarPeriodo(actual.id);
    });
  }

  cambiarPeriodo(id: string) {
    this.periodoId.set(id);
    this.cargando.set(true);
    this.error.set(null);
    this.asistenciasService.seguimiento(id).subscribe({
      next: (d) => { this.datos.set(d); this.cargando.set(false); },
      error: (e) => { this.error.set(e?.error?.message ?? 'No se pudo calcular el seguimiento'); this.cargando.set(false); },
    });
  }

  abrirReceso() {
    this.mensajeReceso.set(null);
    this.receso.set({ desde: '', hasta: '', motivo: 'vacaciones', observacion: '' });
  }

  actualizarReceso(campo: 'desde' | 'hasta' | 'motivo' | 'observacion', valor: string) {
    this.receso.update((r) => r && { ...r, [campo]: valor });
  }

  guardarReceso() {
    const r = this.receso();
    if (!r) return;
    if (!r.desde || !r.hasta || r.hasta < r.desde) {
      this.mensajeReceso.set('Indica un rango de fechas válido.');
      return;
    }
    if (r.motivo === 'otro' && !r.observacion.trim()) {
      this.mensajeReceso.set('Describe el motivo del receso.');
      return;
    }
    if (!confirm(`Se marcarán como "no realizadas" todas las clases programadas del ${r.desde} al ${r.hasta} en todos los cursos del periodo. ¿Continuar?`)) return;

    this.guardandoReceso.set(true);
    this.asistenciasService.registrarReceso({
      periodoId: this.periodoId(), desde: r.desde, hasta: r.hasta, motivo: r.motivo,
      ...(r.observacion.trim() && { observacion: r.observacion.trim() }),
    }).subscribe({
      next: (res) => {
        this.guardandoReceso.set(false);
        this.receso.set(null);
        this.mensajeReceso.set(`Receso registrado: ${res.marcadas} clase(s) en ${res.cursos} curso(s). Las fechas que ya tenían asistencia no se modificaron.`);
        this.cambiarPeriodo(this.periodoId());
      },
      error: (e) => { this.guardandoReceso.set(false); this.mensajeReceso.set(e?.error?.message ?? 'No se pudo registrar el receso'); },
    });
  }

  etiquetaMotivo(m: string): string {
    return this.motivos.find((x) => x.valor === m)?.etiqueta ?? m;
  }

  alternar(id: string) {
    this.abiertos.update((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  // Correo prellenado con las clases pendientes del docente
  enlaceCorreo(d: FilaDocente): string | null {
    if (!d.email) return null;
    const pendientes = d.cursos.filter((c) => c.faltantes.length);
    const cuerpo = [
      `Hola ${d.nombre.split(' ')[0]},`,
      '',
      'En la plataforma no aparece registrada la asistencia de las siguientes clases:',
      '',
      ...pendientes.flatMap((c) => [`• ${c.curso}: ${c.faltantes.slice().reverse().map((f) => this.fechaLarga(f)).join(', ')}`]),
      '',
      'Por favor regístrala en Mi horario → curso → Pasar lista, eligiendo la fecha de cada clase.',
      'Si alguna de esas clases no se dictó, cuéntanos el motivo.',
      '',
      'Gracias.',
    ].join('\n');
    const asunto = `Asistencia pendiente por registrar (${d.faltantes} clase${d.faltantes === 1 ? '' : 's'})`;
    return `mailto:${d.email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
  }

  exportarCsv() {
    const filas = [['Docente', 'Correo', 'Curso', 'Asignatura', 'Inscritos', 'Clases esperadas', 'Con asistencia', 'Sin asistencia', 'Cumplimiento %', 'Última asistencia', 'Fechas sin asistencia']];
    for (const d of this.filtrados()) {
      for (const c of d.cursos) {
        filas.push([
          d.nombre, d.email ?? '', c.curso, c.asignatura ?? '', String(c.inscritos), String(c.esperadas), String(c.registradas),
          String(c.faltantes.length), c.cumplimiento === null ? '' : String(c.cumplimiento), c.ultimaFecha ?? '',
          c.faltantes.slice().reverse().join(' '),
        ]);
      }
    }
    const csv = '﻿' + filas.map((f) => f.map((v) => `"${v.replace(/"/g, '""')}"`).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `seguimiento-asistencia-${this.datos()?.hasta ?? 'hoy'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  claseCumplimiento(p: number | null): string {
    if (p === null) return 'bg-gray-100 text-gray-500';
    if (p >= 90) return 'bg-emerald-50 text-emerald-700';
    if (p >= 70) return 'bg-amber-50 text-amber-800';
    return 'bg-red-50 text-red-700';
  }

  fechaCorta(f: string): string {
    return new Date(f + 'T00:00:00').toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' }).replace(/\./g, '');
  }

  fechaLarga(f: string): string {
    return new Date(f + 'T00:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  diasSinTomar(ultima: string | null): number | null {
    if (!ultima) return null;
    return Math.floor((Date.now() - new Date(ultima + 'T00:00:00').getTime()) / 86_400_000);
  }

  textoDias(dias: string[]): string {
    const corto: Record<string, string> = { lunes: 'Lun', martes: 'Mar', miercoles: 'Mié', jueves: 'Jue', viernes: 'Vie', sabado: 'Sáb', domingo: 'Dom' };
    return dias.map((d) => corto[d] ?? d).join(', ');
  }

  private normalizar(s: string): string {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }
}
