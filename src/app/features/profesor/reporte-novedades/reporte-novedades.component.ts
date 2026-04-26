import { Component, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../auth/services/auth.service';
import { Novedad } from '../../../models/novedad';
import { NovedadService } from '../../../services/novedad.service';

@Component({
  selector: 'app-reporte-novedades',
  imports: [ReactiveFormsModule],
  templateUrl: './reporte-novedades.component.html',
 
})
export class ReporteNovedadesComponent {

  authService = inject(AuthService);
  novedadService = inject(NovedadService);

  enviado  = signal(false);
  cargando = signal(false);
  error    = signal<string | null>(null);
  tipo = signal<'cambio_horario' | 'incapacidad'>('cambio_horario');
  
  reporteForm = new FormGroup({
    nombreDocente: new FormControl<string>(this.authService.user()?.user_metadata.nombre || '', [Validators.required]),
    curso: new FormControl<string>('', [Validators.required]),
    tipoNovedad: new FormControl<'cambio_horario' | 'incapacidad'>('cambio_horario', [Validators.required]),
    motivo: new FormControl<string>('', [Validators.required]),
    fechaOriginal: new FormControl<string>(''),
    nuevaFecha: new FormControl<string>(''),
    fechaInicioIncapacidad: new FormControl<string>(''),
    fechaFinIncapacidad: new FormControl<string>('')
  })
enviarReporte() {
  if (this.reporteForm.invalid) {
    this.reporteForm.markAllAsTouched(); //  activa los mensajes de error rojos en el HTML
    this.error.set('Por favor, completa todos los campos obligatorios.');
    return;
  }

  this.cargando.set(true);
  this.error.set(null);
  
  const reporte = this.reporteForm.value;
  
  this.novedadService.reporteNovedad({
    nombreDocente: reporte.nombreDocente ?? '',
    curso: reporte.curso ?? '',
    tipoNovedad: reporte.tipoNovedad ?? 'cambio_horario',
    motivo: reporte.motivo ?? '',
    fechaOriginal: reporte.fechaOriginal || "",
    nuevaFecha: reporte.nuevaFecha || "",
    fechaInicioIncapacidad: reporte.fechaInicioIncapacidad || "",
    fechaFinIncapacidad: reporte.fechaFinIncapacidad || ""
  }).subscribe({
    next: () => {
      this.enviado.set(true);
      this.cargando.set(false);
    },
    error: (err) => {
      this.error.set('Error al enviar el reporte: ' + (err.message || 'Error desconocido'));
      this.cargando.set(false);
    }
  });
}

      nuevaNovedad(): void {
    this.reporteForm.reset({
      nombreDocente: this.authService.user()?.user_metadata['nombre'] ?? '',
    });
    this.enviado.set(false);
    this.error.set(null);
  }
   seleccionarTipo(tipo: 'cambio_horario' | 'incapacidad'): void {
    this.reporteForm.patchValue({ tipoNovedad: tipo });
    this.tipo.set(tipo);
  }
 
  // ── Helpers de validación para el template ──────────────────────
  campoInvalido(nombre: string): boolean {
    const ctrl = this.reporteForm.get(nombre)!;
    return ctrl.invalid && ctrl.touched;
  }
  }
  
