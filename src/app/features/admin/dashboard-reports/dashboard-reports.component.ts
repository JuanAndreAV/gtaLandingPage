import { Component, OnInit, inject, signal } from '@angular/core';
import { MetricasService } from '../../../services/metricas.service';
import { MetricasAdmin } from '../../../models/metricas';
import { CommonModule } from '@angular/common';
import { NavigateOptionsComponent } from '../navigate-options/navigate-options.component';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
@Component({
  selector: 'app-dashboard-reports',
  imports: [CommonModule, BaseChartDirective, NavigateOptionsComponent],
  templateUrl: './dashboard-reports.component.html',
  styleUrl: './dashboard-reports.component.css',
})
export class DashboardReportsComponent implements OnInit {
 private metricasService = inject(MetricasService);
  

  metricas = signal<MetricasAdmin | null>(null);
  loading = signal(true);
  error = signal('');

  // ✅ Configuración de gráficos
  // Gráfico de Línea
  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: []
  };
  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };
  lineChartType: ChartType = 'line';

  // Gráfico de Dona
  doughnutChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: []
  };
  doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };
  doughnutChartType: ChartType = 'doughnut';

  // Gráfico de Barras
  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };
  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    }
  };
  barChartType: ChartType = 'bar';

  ngOnInit(): void {
    this.loadMetricas();
  }

  private loadMetricas(): void {
    this.loading.set(true);
    this.metricasService.getMetricasAdmin().subscribe({
      next: (data) => {
        console.log('✅ Datos cargados:', data);
        this.metricas.set(data);
        this.prepareChartData(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('❌ Error:', err);
        this.error.set('Error al cargar métricas');
        this.loading.set(false);
      }
    });
  }

  private prepareChartData(data: MetricasAdmin): void {
    // Gráfico de línea - Tendencia
    this.lineChartData = {
      labels: data.tendenciaInscripciones.map(t => t.mes),
      datasets: [
        {
          label: 'Inscripciones',
          data: data.tendenciaInscripciones.map(t => t.inscripciones),
          borderColor: '#00897B',
          backgroundColor: 'rgba(0, 137, 123, 0.1)',
          tension: 0.4,
          fill: true,
          borderWidth: 3
        },
        {
          label: 'Deserciones',
          data: data.tendenciaInscripciones.map(t => t.deserciones),
          borderColor: '#FF6B35',
          backgroundColor: 'rgba(255, 107, 53, 0.1)',
          tension: 0.4,
          fill: true,
          borderWidth: 3
        }
      ]
    };

    // Gráfico de dona - Distribución
    this.doughnutChartData = {
      labels: data.distribucionPorCategoria.map(c => c.categoria),
      datasets: [{
        label: 'Cantidad',
        data: data.distribucionPorCategoria.map(c => c.cantidad),
        backgroundColor: [
          '#00897B', // Teal
          '#F9D423', // Yellow
          '#FF6B35', // Orange
          '#4DD0E1'  // Blue
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };

    // Gráfico de barras - Top 5 cursos
    const topCursos = data.cursosMasPopulares.slice(0, 5);
    this.barChartData = {
      labels: topCursos.map(c => c.nombre),
      datasets: [{
        label: 'Estudiantes Inscritos',
        data: topCursos.map(c => c.inscritos),
        backgroundColor: '#00897B',
        borderRadius: 8
      }]
    };
  }

  getEstadoColor(porcentaje: number): string {
    if (porcentaje >= 80) return 'text-green-600';
    if (porcentaje >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }

  getBadgeColor(porcentaje: number): string {
    if (porcentaje >= 80) return 'bg-green-100 text-green-800';
    if (porcentaje >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
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

 

  refresh(): void {
    this.loadMetricas();
  }
 
}
