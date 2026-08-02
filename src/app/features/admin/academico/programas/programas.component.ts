import { Component, inject, signal, OnInit } from '@angular/core';
import { ProgramasService } from '../../../../services/gestion-academica/programas.service';
import { Programa, CreateProgramaDto, AreaArtistica } from '../../../../models/gestion-academica/programa';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { TitleComponent } from '../../../../shared/components/title/title.component';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-programas',
  imports: [
    ReactiveFormsModule,
    TitleComponent,
    SpinnerComponent
  ],
  templateUrl: './programas.component.html',
  styleUrl: './programas.component.css',
})
export class ProgramasComponent implements OnInit {
  programasService = inject(ProgramasService);

  areas = Object.values(AreaArtistica);

  modalAbierto = signal(false);
  modoEdicion = signal(false);
  guardando = signal(false);
  formularioEnviado = false;
  programaEditando: Programa | null = null;

  programaForm = new FormGroup({
    nombre: new FormControl('', Validators.required),
    area: new FormControl<AreaArtistica | null>(null, Validators.required),
    descripcion: new FormControl(''),
    colorHex: new FormControl('#6366f1'),
  });


  ngOnInit() {
    this.programasService.listarProgramas().subscribe();
  }

  abrirModalNuevo() {
    this.modoEdicion.set(false);
    this.programaEditando = null;
    this.programaForm.reset();
    this.formularioEnviado = false;
    this.modalAbierto.set(true);
  }

  editar(programa: Programa) {
    this.modoEdicion.set(true);
    this.programaEditando = programa;
    this.programaForm.patchValue({
      nombre: programa.nombre,
      area: programa.area,
      descripcion: programa.descripcion ?? '',
      colorHex: programa.colorHex ?? '#6366f1',
    });
    this.formularioEnviado = false;
    this.modalAbierto.set(true);
  }

  cerrarModal() {
    this.modalAbierto.set(false);
  }

  guardar() {
    this.formularioEnviado = true;
    if (!this.programaForm.value.nombre || !this.programaForm.value.area) return;

    this.guardando.set(true);
    const obs = this.modoEdicion() && this.programaEditando
      ? this.programasService.actualizarPrograma(this.programaEditando.id, this.programaForm.value as CreateProgramaDto)
      : this.programasService.crearPrograma(this.programaForm.value as CreateProgramaDto);

    obs.subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarModal();
        this.programasService.listarProgramas().subscribe();
      },
      error: (err) => {
        this.guardando.set(false);
        alert(err.error?.message ?? 'Error al guardar el programa');
      },
    });
  }

  desactivar(programa: Programa) {
    if (!confirm(`¿Desactivar el programa "${programa.nombre}"?`)) return;
    this.programasService.desactivarPrograma(programa.id).subscribe({
      next: () => this.programasService.listarProgramas().subscribe(),
      error: (err) => alert(err.error?.message ?? 'Error al desactivar'),
    });
  }

}
