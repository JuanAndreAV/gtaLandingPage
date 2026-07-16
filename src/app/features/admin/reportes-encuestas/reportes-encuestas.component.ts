import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { EncuestaService } from '../../../services/encuesta.service';
import { Q10Service } from '../../../services/q10.service';
import { TitleComponent } from '../../../shared/components/title/title.component';

@Component({
  selector: 'app-reportes-encuestas',
  imports: [TitleComponent],
  templateUrl: './reportes-encuestas.component.html',
  styleUrl: './reportes-encuestas.component.css',
})
export class ReportesEncuestasComponent implements OnInit  {
encuestaService = inject(EncuestaService);
q10Service = inject(Q10Service);
profesorSeleccionado = signal<any[]>([]);

ngOnInit(): void {
  this.q10Service.obtenerCursos().subscribe({})
  this.encuestaService.verEncuestas().subscribe({})
  
};

encuestas = computed(()=> this.encuestaService.todasLasEncuestas());

profesores = computed(()=>  this.encuestas().map(p=> ({usuario: p.usuario, documento: p.documento})).filter((value, index, self) => index === self.findIndex((t) => t.documento === value.documento)));
  

seleccionProfesor(profesor: any){
  this.profesorSeleccionado.set([])
  if(profesor){
    const seleccion = this.encuestas().filter(p=> p.documento === profesor );
    this.profesorSeleccionado.set(seleccion)
  }
  //console.log(this.profesorSeleccionado())
};

toggleEstado(encuesta: any){
  this.encuestaService.actualizarEstado(encuesta._id, !encuesta.estado).subscribe({
    next: ()=>{
      this.encuestaService.verEncuestas().subscribe({
        next: ()=>{
          this.seleccionProfesor(encuesta.documento)
        }
      })
      
    }
  })
}



}
