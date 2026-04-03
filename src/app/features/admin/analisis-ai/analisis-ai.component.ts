import { Component, inject, OnInit, signal } from '@angular/core';
import { Q10AsistenciaService } from '../../../services/academico/q10-asistencia.service';
import { Q10PoblacionService } from '../../../services/academico/q10-poblacion.service';
import { Q10Service } from '../../../services/q10.service';
import { AiAsistenciaService } from '../../../services/ai-asistencia.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-analisis-ai',
  imports: [ReactiveFormsModule, CommonModule, MarkdownModule],
  templateUrl: './analisis-ai.component.html',
  styleUrl: './analisis-ai.component.css',
})
export class AnalisisAiComponent implements OnInit {

  public asistenciaService = inject(Q10AsistenciaService);
  public poblacionService  = inject(Q10PoblacionService);
  public reportesService   = inject(Q10Service);
  public aiService         = inject(AiAsistenciaService);

  public mensajeError   = signal<string | null>(null);
  public reporteVisible = signal<boolean>(false);
  public expandidos     = signal<Set<string>>(new Set());

  private hoy          = new Date();
  private primerDiaMes = new Date(this.hoy.getFullYear(), this.hoy.getMonth(), 1)
    .toISOString().split('T')[0];
  private hoyStr       = this.hoy.toISOString().split('T')[0];

  // ✅ Corrección: FormControl en lugar de FormGroup para campos simples
  asistenciaForm = new FormGroup({
    fechaInicio: new FormControl(this.primerDiaMes, [Validators.required]),
    fechaFin:    new FormControl(this.hoyStr,       [Validators.required]),
  });

  
  ngOnInit() {
  this.reportesService.obtenerCursos().subscribe(() => {
    this.reportesService.obtenerTodosLosEstudiantesPeriodo(3).subscribe(() => {
      this.poblacionService.obtenerPoblacionQ10(0).subscribe(() => {

        // ✅ Aquí ya tienen valores reales
        this.asistenciaService.actualizarDatos(
          this.poblacionService.poblacionQ10().length,
          this.reportesService.todosLosEstudiantes().length,
          this.reportesService.statsAdmin().totalCursos
        );

      });
    });
  });
}

  obtenerInasistencia() {
    this.mensajeError.set(null);
    if (this.asistenciaForm.invalid) {
      this.mensajeError.set('Por favor, complete ambos campos de fecha.');
      this.asistenciaForm.markAllAsTouched();
      return;
    }
    const { fechaInicio, fechaFin } = this.asistenciaForm.value;
    if (fechaInicio! > fechaFin!) {
      this.mensajeError.set('La fecha de inicio no puede ser mayor a la fecha fin.');
      return;
    }
    this.reporteVisible.set(false);
    this.expandidos.set(new Set());
    this.asistenciaService.obtenerInasistencia(fechaInicio!, fechaFin!).subscribe({
      next: () => this.reporteVisible.set(true),
    });
  }

  generarAnalisisAI() {
    const datos = this.asistenciaService.datosInasistencia();
    if (!datos) {
      this.mensajeError.set('Primero carga los datos de inasistencia.');
      return;
    }
    this.aiService.analizarAsistencia(datos);
  }

  exportarPDF() {
    window.print();
  }
}