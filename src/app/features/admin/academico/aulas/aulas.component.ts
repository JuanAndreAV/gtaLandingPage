import { Component, signal, inject } from '@angular/core';
import { Aulas as Aula, CreateAulaDto } from '../../../../models/gestion-academica/aulas';
import { AulasService } from '../../../../services/gestion-academica/aulas.service';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { TitleComponent } from '../../../../shared/components/title/title.component';
import { ConfirmPopupComponent } from '../../../shared/components/confirm-popup/confirm-popup.component';

@Component({
  selector: 'app-aulas',
  imports: [ReactiveFormsModule, SpinnerComponent, TitleComponent, ConfirmPopupComponent],
  templateUrl: './aulas.component.html',
  styleUrl: './aulas.component.css',
})
export class AulasComponent {
  aulasService = inject(AulasService);

  modalAbierto = signal(false);
  modoEdicion = signal(false);
  guardando = signal(false);
  aulaEditando: Aula | null = null;
  formularioEnviado = false;

  confirmPopup = signal(false);
  aula = signal<Aula | null>(null);

  //form: CreateAulaDto = { nombre: '', capacidad: undefined, descripcion: '' };
  aulaForm = new FormGroup({
    nombre: new FormControl('', Validators.required),
    capacidad: new FormControl<number | null>(null, [Validators.min(1)]),
    descripcion: new FormControl(''),
  });

  ngOnInit() {
    this.aulasService.listar().subscribe();
  }

  abrirModalNueva() {
    this.modoEdicion.set(false);
    this.aulaEditando = null;
    this.aulaForm.reset();
    this.formularioEnviado = false;
    this.modalAbierto.set(true);
  }

  editar(aula: Aula) {
    this.modoEdicion.set(true);
    this.aulaEditando = aula;
    this.aulaForm.patchValue({
      nombre: aula.nombre,
      capacidad: aula.capacidad ?? null,
      descripcion: aula.descripcion ?? '',
    });
    this.formularioEnviado = false;
    this.modalAbierto.set(true);
  }

  cerrarModal() {
    this.modalAbierto.set(false);
  }

  guardar() {
    this.formularioEnviado = true;
    if (!this.aulaForm.get('nombre')?.value) return;

    this.guardando.set(true);   
    const nombreVal = String(this.aulaForm.get('nombre')?.value ?? '');
    const capacidadVal = this.aulaForm.get('capacidad')?.value ?? undefined;
    const descripcionVal = String(this.aulaForm.get('descripcion')?.value ?? '');

    const obs = this.modoEdicion() && this.aulaEditando
      ? this.aulasService.actualizar(this.aulaEditando.id, { nombre: nombreVal,
        capacidad: capacidadVal,
        descripcion: descripcionVal })
      : this.aulasService.crear({ nombre: nombreVal,
        capacidad: capacidadVal,
        descripcion: descripcionVal });

    obs.subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarModal();
        this.aulasService.listar().subscribe();
      },
      error: (err) => {
        this.guardando.set(false);
        alert(err.error?.message ?? 'Error al guardar el aula');
      },
    });
  }
// modal y confirmar o no desactivar
  desactivarModal(aula: Aula) {
    this.confirmPopup.set(true);
    this.aula.set(aula);
  }
  desactivar(estado: boolean | null) {
    if (!estado){
      this.confirmPopup.set(false);
      this.aula.set(null);
      return
    }
    const aulaId = this.aula()?.id;
    if (!aulaId) return;
     this.aulasService.desactivar(aulaId).subscribe({
      next: () => this.aulasService.listar().subscribe(),
      error: (err) => alert(err.error?.message ?? 'Error al desactivar'),
    });
    this.confirmPopup.set(false);
    this.aula.set(null);


  }


}
