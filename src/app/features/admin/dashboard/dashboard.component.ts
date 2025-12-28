import { Component, inject, signal } from '@angular/core';
import { MetricasService } from '../../../services/metricas.service';
import { MetricasAdmin } from '../../../models/metricas';
import { ChartModule } from 'primeng/chart';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-dashboard',
  imports: [CommonModule,ChartModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  standalone: true
})
export class DashboardComponent {
  private metricasService = inject(MetricasService);

  metricas = signal<MetricasAdmin | null>(null);
  loading = signal(true);
  error = signal('');

  // Datos para gráficos
  tendenciaChartData: any;
  categoriaChartData: any;
  asistenciaChartData: any;

  // Opciones de gráficos
  chartOptions: any;

  ngOnInit(): void {
    this.loadMetricas();
    this.setupChartOptions();
  }

  private loadMetricas(): void {
    this.loading.set(true);
    this.metricasService.getMetricasAdmin().subscribe({
      next: (data) => {
        this.metricas.set(data);
        this.prepareChartData(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading metrics:', err);
        this.error.set('Error al cargar las métricas');
        this.loading.set(false);
      }
    });
  }

  private prepareChartData(data: MetricasAdmin): void {
    // Gráfico de tendencia de inscripciones
    this.tendenciaChartData = {
      labels: data.tendenciaInscripciones.map(t => t.mes),
      datasets: [
        {
          label: 'Inscripciones',
          data: data.tendenciaInscripciones.map(t => t.inscripciones),
          borderColor: '#00897B',
          backgroundColor: 'rgba(0, 137, 123, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Deserciones',
          data: data.tendenciaInscripciones.map(t => t.deserciones),
          borderColor: '#FF6B35',
          backgroundColor: 'rgba(255, 107, 53, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    };

    // Gráfico de distribución por categoría
    this.categoriaChartData = {
      labels: data.distribucionPorCategoria.map(c => c.categoria),
      datasets: [{
        data: data.distribucionPorCategoria.map(c => c.cantidad),
        backgroundColor: [
          '#00897B',
          '#F9D423',
          '#FF6B35',
          '#4DD0E1',
          '#9C27B0'
        ]
      }]
    };

    // Gráfico de cursos más populares
    const topCursos = data.cursosMasPopulares.slice(0, 5);
    this.asistenciaChartData = {
      labels: topCursos.map(c => c.nombre),
      datasets: [{
        label: 'Inscritos',
        data: topCursos.map(c => c.inscritos),
        backgroundColor: '#00897B'
      }]
    };
  }

  private setupChartOptions(): void {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    };
  }

  exportarExcel(): void {
    this.metricasService.exportarReporte('excel').subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reporte_${new Date().getTime()}.xlsx`;
        link.click();
      },
      error: (err) => {
        console.error('Error exporting:', err);
      }
    });
  }

  exportarPDF(): void {
    this.metricasService.exportarReporte('pdf').subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reporte_${new Date().getTime()}.pdf`;
        link.click();
      },
      error: (err) => {
        console.error('Error exporting:', err);
      }
    });
  }

  getEstadoColor(porcentaje: number): string {
    if (porcentaje >= 80) return 'text-green-600';
    if (porcentaje >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }

  refresh(): void {
    this.loadMetricas();
  }
}
