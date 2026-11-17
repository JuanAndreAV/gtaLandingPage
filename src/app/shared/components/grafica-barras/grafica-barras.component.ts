import { Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { Conteo } from '../../../models/analitica';

/** Tokens de la gráfica (paleta validada con el validador de dataviz). */
export const VIZ = {
  serie1: '#1c7a2e',   // verde institucional
  serie2: '#2a78d6',   // azul (pasa CVD junto al verde)
  texto: '#374151',
  tenue: '#6b7280',
  grilla: '#e5e7eb',
  eje: '#d1d5db',
  fuente: "'Poppins', ui-sans-serif, system-ui, sans-serif",
};

@Component({
  selector: 'app-grafica-barras',
  standalone: true,
  imports: [BaseChartDirective, DecimalPipe],
  template: `
    <figure class="bg-white rounded-xl ring-1 ring-black/5 shadow-sm p-5 h-full flex flex-col">
      <figcaption class="mb-3">
        <h3 class="text-base font-semibold text-gray-900">{{ titulo() }}</h3>
        @if (subtitulo()) {
          <p class="text-xs text-gray-500 mt-0.5">{{ subtitulo() }}</p>
        }
      </figcaption>

      @if (filas().length) {
        <div class="relative" [style.height.px]="alto()">
          <canvas baseChart type="bar" [data]="data()" [options]="opciones()"
                  role="img" [attr.aria-label]="titulo()"></canvas>
        </div>

        <details class="mt-3 text-sm group">
          <summary class="cursor-pointer select-none text-xs font-medium text-gray-500 hover:text-gray-700">
            Ver tabla
          </summary>
          <table class="mt-2 w-full text-left">
            <thead>
              <tr class="text-xs text-gray-500 border-b border-gray-100">
                <th class="py-1.5 font-medium">{{ etiquetaColumna() }}</th>
                <th class="py-1.5 font-medium text-right">{{ unidad() }}</th>
                <th class="py-1.5 font-medium text-right">%</th>
              </tr>
            </thead>
            <tbody class="tabular-nums">
              @for (f of filas(); track f.etiqueta) {
                <tr class="border-b border-gray-50 last:border-0">
                  <td class="py-1.5 text-gray-700">{{ f.etiqueta }}</td>
                  <td class="py-1.5 text-right text-gray-900">{{ f.total }}</td>
                  <td class="py-1.5 text-right text-gray-500">{{ porcentaje(f.total) | number:'1.0-1' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </details>
      } @else {
        <div class="flex-1 flex items-center justify-center py-10 text-sm text-gray-400">
          Sin datos para este filtro
        </div>
      }
    </figure>
  `,
})
export class GraficaBarrasComponent {
  titulo = input.required<string>();
  subtitulo = input<string>('');
  items = input<Conteo[]>([]);
  orientacion = input<'horizontal' | 'vertical'>('horizontal');
  unidad = input<string>('Personas');
  etiquetaColumna = input<string>('Categoría');
  /** Máximo de barras; el resto se agrupa en "Otros". 0 = sin límite. */
  maximo = input<number>(8);
  color = input<string>(VIZ.serie1);

  filas = computed<Conteo[]>(() => {
    const lista = this.items() ?? [];
    const max = this.maximo();
    if (!max || lista.length <= max) return lista;
    const visibles = lista.slice(0, max - 1);
    const resto = lista.slice(max - 1).reduce((s, x) => s + x.total, 0);
    return [...visibles, { etiqueta: 'Otros', total: resto }];
  });

  private suma = computed(() => this.filas().reduce((s, x) => s + x.total, 0));

  porcentaje(v: number) {
    return this.suma() ? (100 * v) / this.suma() : 0;
  }

  alto = computed(() =>
    this.orientacion() === 'horizontal' ? Math.max(120, this.filas().length * 34 + 40) : 260,
  );

  data = computed<ChartConfiguration<'bar'>['data']>(() => ({
    labels: this.filas().map(f => f.etiqueta),
    datasets: [{
      label: this.unidad(),
      data: this.filas().map(f => f.total),
      backgroundColor: this.color(),
      hoverBackgroundColor: this.color() + 'cc',
      borderRadius: 4,
      borderSkipped: 'start',     // redondea solo el extremo del dato
      maxBarThickness: 22,
      categoryPercentage: 0.8,
      barPercentage: 0.9,
    }],
  }));

  opciones = computed<ChartConfiguration<'bar'>['options']>(() => {
    const horizontal = this.orientacion() === 'horizontal';
    const ejeValor = {
      beginAtZero: true,
      grid: { color: VIZ.grilla, drawTicks: false },
      border: { display: false },
      ticks: { color: VIZ.tenue, precision: 0, padding: 6, font: { family: VIZ.fuente, size: 11 } },
    };
    const ejeCategoria = {
      grid: { display: false },
      border: { color: VIZ.eje },
      ticks: { color: VIZ.texto, font: { family: VIZ.fuente, size: 12 }, autoSkip: false },
    };
    return {
      indexAxis: horizontal ? 'y' : 'x',
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 300 },
      interaction: { mode: 'index', intersect: false },   // hover por fila, no solo sobre la barra
      scales: horizontal ? { x: ejeValor, y: ejeCategoria } : { x: ejeCategoria, y: ejeValor },
      plugins: {
        legend: { display: false },                       // una serie: el título la nombra
        tooltip: {
          backgroundColor: '#111827',
          padding: 10,
          cornerRadius: 6,
          displayColors: false,
          titleFont: { family: VIZ.fuente, weight: 600 },
          bodyFont: { family: VIZ.fuente },
          callbacks: {
            label: ctx => {
              const v = Number(ctx.raw);
              return `${v} ${this.unidad().toLowerCase()} · ${this.porcentaje(v).toFixed(1)}%`;
            },
          },
        },
      },
    } as ChartConfiguration<'bar'>['options'];
  });
}
