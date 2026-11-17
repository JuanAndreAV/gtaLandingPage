import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { AnaliticaService } from '../../../services/analitica.service';
import { ProgramasService } from '../../../services/gestion-academica/programas.service';
import { Analitica, Conteo } from '../../../models/analitica';
import { GraficaBarrasComponent, VIZ } from '../../../shared/components/grafica-barras/grafica-barras.component';

const ESTADOS: Record<string, string> = {
  activa: 'Activa',
  pendiente: 'Pendiente',
  en_espera: 'En espera',
  retirada: 'Retirada',
  suspendida: 'Suspendida',
  finalizada: 'Finalizada',
};

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

@Component({
  selector: 'app-dashboard-reports',
  standalone: true,
  imports: [DecimalPipe, FormsModule, BaseChartDirective, GraficaBarrasComponent],
  templateUrl: './dashboard-reports.component.html',
  styleUrl: './dashboard-reports.component.css',
})
export class DashboardReportsComponent implements OnInit {
  private analiticaService = inject(AnaliticaService);
  programasService = inject(ProgramasService);

  readonly VIZ = VIZ;

  datos = signal<Analitica | null>(null);
  cargando = signal(true);
  error = signal('');
  periodoId = signal('');

  // ── Derivados ──────────────────────────────────────────
  resumen = computed(() => this.datos()?.resumen);
  pob = computed(() => this.datos()?.poblacion);
  ins = computed(() => this.datos()?.inscripciones);

  porEstado = computed<Conteo[]>(() =>
    (this.ins()?.porEstado ?? []).map(e => ({ etiqueta: ESTADOS[e.etiqueta] ?? e.etiqueta, total: e.total })),
  );

  ocupacion = computed(() => (this.ins()?.ocupacion ?? []).slice(0, 10));
  totalCursos = computed(() => this.ins()?.ocupacion.length ?? 0);
  cursosLlenos = computed(() => (this.ins()?.ocupacion ?? []).filter(c => (c.porcentaje ?? 0) >= 100).length);

  pctDiscapacidad = computed(() => {
    const d = this.pob()?.discapacidad ?? [];
    const con = d.find(x => x.etiqueta === 'Con discapacidad')?.total ?? 0;
    const conDato = d.filter(x => x.etiqueta !== 'Sin dato').reduce((s, x) => s + x.total, 0);
    return conDato ? (100 * con) / conDato : null;
  });

  // ── Serie mensual (Inscripciones vs Retiros, un solo eje) ──
  lineaData = computed<ChartConfiguration<'line'>['data']>(() => {
    const meses = this.ins()?.porMes ?? [];
    const serie = (label: string, data: number[], color: string) => ({
      label,
      data,
      borderColor: color,
      backgroundColor: color,
      borderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      tension: 0.25,
      fill: false,
    });
    return {
      labels: meses.map(m => {
        const [y, mm] = m.mes.split('-');
        return `${MESES[+mm - 1]} ${y.slice(2)}`;
      }),
      datasets: [
        serie('Inscripciones', meses.map(m => m.total), VIZ.serie1),
        serie('Retiros', meses.map(m => m.retiradas), VIZ.serie2),
      ],
    };
  });

  lineaOpciones: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },       // crosshair: todas las series del mes
    scales: {
      x: {
        grid: { display: false },
        border: { color: VIZ.eje },
        ticks: { color: VIZ.texto, font: { family: VIZ.fuente, size: 11 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: VIZ.grilla, drawTicks: false },
        border: { display: false },
        ticks: { color: VIZ.tenue, precision: 0, padding: 6, font: { family: VIZ.fuente, size: 11 } },
      },
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: { usePointStyle: true, pointStyle: 'circle', boxWidth: 8, color: VIZ.texto, font: { family: VIZ.fuente, size: 12 } },
      },
      tooltip: {
        backgroundColor: '#111827',
        padding: 10,
        cornerRadius: 6,
        usePointStyle: true,
        titleFont: { family: VIZ.fuente, weight: 600 },
        bodyFont: { family: VIZ.fuente },
      },
    },
  };

  ngOnInit(): void {
    if (!this.programasService.periodos().length) this.programasService.listarPeriodos().subscribe();
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.analiticaService.obtener(this.periodoId() || undefined).subscribe({
      next: d => { this.datos.set(d); this.cargando.set(false); },
      error: e => {
        this.error.set(e.error?.message ?? 'No se pudo cargar la analítica');
        this.cargando.set(false);
      },
    });
  }

  onPeriodoChange(id: string) {
    this.periodoId.set(id);
    this.cargar();
  }

  nombreMes(mes: string) {
    const [y, mm] = mes.split('-');
    return `${MESES[+mm - 1]} ${y}`;
  }
}
