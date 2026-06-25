import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { EncuestaService } from '../../services/encuesta.service';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { Q10Service } from '../../services/q10.service';
import { TitleComponent } from '../../shared/components/title/title.component';
export interface Encuesta {
  encuestaId: string;
  usuario: string;
  documento: string;
  campoPersonalizado: string;
  respuestas: any[];
}
@Component({
  selector: 'app-encuestas',
  imports: [ReactiveFormsModule, SpinnerComponent, TitleComponent],
  templateUrl: './encuestas.component.html',
  styleUrl: './encuestas.component.css',
})
export class EncuestasComponent implements OnInit{
  public encuestaService = inject(EncuestaService);
  isPosting = signal(false);
  q10Service = inject(Q10Service);

  docenteSeleccionado = signal<string>('');
  mensajeConfirmacion = signal<string | null>(null);
  mensajeError = signal<string | null>(null);

  ngOnInit() {
    this.q10Service.obtenerCursos().subscribe({})
  };

  seleccionarDocente(docente: string){
    if (docente) {
      this.docenteSeleccionado.set(docente);
    } else {
      this.docenteSeleccionado.set('');
    }
  }

  cursos = computed(() => this.q10Service.cursos().filter( cursos => cursos.Nombre_docente === this.docenteSeleccionado())); 

  /*preguntas =  signal([
    { id: 'pregunta1', texto: '¿Cómo calificarías la calidad de la enseñanza?' },
    { id: 'pregunta2', texto: '¿Recomendarías esta institución a otros estudiantes?' },
    { id: 'pregunta3', texto: '¿Qué aspectos mejorarías en la institución?' },
  ]);*/
  encuestaForm = new FormGroup({
  usuario: new FormControl('', [Validators.required, Validators.minLength(3)]),
  respuestas: new FormArray([]),
});

get respuestasFormArray() {
  return this.encuestaForm.get('respuestas') as FormArray;
}

// Cuando selecciona un curso, lo agrega al FormArray


eliminarCurso(index: number) {
  this.respuestasFormArray.removeAt(index);
}

onToggleModificar(index: number) {
  const grupo = this.respuestasFormArray.at(index) as FormGroup;
  const modificar = grupo.get('modificar')?.value;
  const campos = ['horario', 'cupo', 'salon', 'edadMinima', 'edadMaxima', 'prerequisitos', 'observaciones'];

  campos.forEach(campo => {
    modificar ? grupo.get(campo)?.enable() : grupo.get(campo)?.disable();
  });
}


enviar() {
  if (this.encuestaForm.invalid) {
    this.encuestaForm.markAllAsTouched();
    return;
  }
 
    const raw = this.encuestaForm.getRawValue(); // incluye disabled

  const payload = {

    encuestaId: 'EncuestaCursosSegundoSemestre2026',
    usuario: this.docenteSeleccionado() || "Juan andres",
    documento: this.q10Service.cursos().find(
      c => c.Nombre_docente === this.docenteSeleccionado())?.Numero_identificacion_docente || "123",
    campoPersonalizado: "2026-2",

    respuestas: raw.respuestas.map((r: any) => ({
      preguntaId:     r.curso,
      respuesta: [{
      esNuevo:       r.esNuevo,
      curso:         r.curso,
      horario:       r.horario       || 'sin cambios',
      cupo:          r.cupo          || 'sin cambios',
      salon:         r.salon         || 'sin cambios',
      edadMinima:    r.edadMinima    || 'sin cambios',
      edadMaxima:    r.edadMaxima    || 'sin cambios',
      prerequisitos: r.prerequisitos || 'sin cambios',
      observaciones: r.observaciones || 'sin cambios',
      modificar:     r.modificar,
    }]
    }))
  };
  
  this.mensajeConfirmacion.set(null);
  this.mensajeError.set(null);
  this.isPosting.set(true);
  this.encuestaService.createEncuesta(payload).subscribe({
    next: (response) => {
      //console.log('Encuesta creada:', response);
      this.isPosting.set(false);
      this.encuestaForm.reset();
      this.mensajeConfirmacion.set('Encuesta enviada con éxito');
    },
    error: (error) => {
      //console.error('Error al crear la encuesta:', error);
      this.isPosting.set(false);
      this.mensajeError.set(error.error?.message || 'Error al enviar la encuesta');
    }
  });
  //console.log('Payload a enviar:', payload);
  
}
agregarCursoNuevo() {
  this.respuestasFormArray.push(new FormGroup({
    curso:         new FormControl('', Validators.required),
    horario:       new FormControl('', Validators.required),
    cupo:          new FormControl('', Validators.required),
    salon:         new FormControl('', Validators.required),
    edadMinima:    new FormControl('', Validators.required),
    edadMaxima:    new FormControl('', Validators.required),
    prerequisitos: new FormControl(''),
    observaciones: new FormControl(''),
    modificar:     new FormControl(true),  // siempre activo
    esNuevo:       new FormControl(true),  // flag para distinguirlo
  }));
}
agregarCurso(nombreCurso: string) {
  if (!nombreCurso) return;
  const yaExiste = this.respuestasFormArray.controls.some(
    c => c.get('curso')?.value === nombreCurso
  );
  if (yaExiste) return;

  this.respuestasFormArray.push(new FormGroup({
    curso:         new FormControl({ value: nombreCurso, disabled: true }),
    horario:       new FormControl({ value: '', disabled: true }),
    cupo:          new FormControl({ value: '', disabled: true }),
    salon:         new FormControl({ value: '', disabled: true }),
    edadMinima:    new FormControl({ value: '', disabled: true }),
    edadMaxima:    new FormControl({ value: '', disabled: true }),
    prerequisitos: new FormControl({ value: '', disabled: true }),
    observaciones: new FormControl({ value: '', disabled: true }),
    modificar:     new FormControl(false),
    esNuevo:       new FormControl(false), // ← 
  }));
}
  
}
