import { Component, signal, computed, inject } from '@angular/core';
import { Q10Service } from '../../services/q10.service';

@Component({
  selector: 'app-q10-consulta-docente',
  imports: [],
  templateUrl: './q10-consulta-docente.component.html',
  styleUrl: './q10-consulta-docente.component.css',
})
export class Q10ConsultaDocenteComponent {
  public q10Service = inject(Q10Service);
  
  // Signal para el filtro de búsqueda del docente seleccionado
  public docenteSeleccionado = signal<string>('');
  
  // Signal para el curso actualmente seleccionado
  public cursoActivo = signal<any>(null);

  // Cursos filtrados por el docente elegido
  public misCursos = computed(() => {
    const seleccion = this.docenteSeleccionado();
    return this.q10Service.cursos().filter(c => c.Nombre_docente === seleccion);
  });

  // Estadísticas totales del docente
  public estadisticas = computed(() => {
    const cursos = this.misCursos();
    return {
      totalCursos: cursos.length,
      totalEstudiantes: cursos.reduce((sum, c) => sum + (c.Cantidad_estudiantes_matriculados || 0), 0),
      cursosActivos: cursos.filter(c => c.Estado === 'Activo').length
    };
  });

  ngOnInit() {
    this.q10Service.obtenerCursos().subscribe();
  }

  seleccionarDocente(nombre: string) {
    this.docenteSeleccionado.set(nombre);
    this.cursoActivo.set(null);
    this.q10Service.estudiantes.set([]);
  }

 
    verAlumnos(curso: any) {
  console.log('📚 Curso seleccionado:', curso);
  console.log('🔍 Parámetros:', {
    periodo: curso.Consecutivo_periodo,
    sedeJornada: curso.Consecutivo_sede_jornada,
    cursoId: curso.Consecutivo
  });
  
  this.cursoActivo.set(curso);
  this.q10Service.obtenerEstudiantesPorCurso(
    curso.Consecutivo_periodo,
    curso.Consecutivo_sede_jornada,
    curso.Consecutivo
  ).subscribe({
    next: (data) => console.log('✅ Estudiantes recibidos:', data),
    error: (err) => console.error('❌ Error:', err)
  });
}
    // this.cursoActivo.set(curso);
    // this.q10Service.obtenerEstudiantesPorCurso(
    //   curso.Consecutivo_periodo,
    //   curso.Consecutivo_sede_jornada,
    //   curso.Consecutivo
    // ).subscribe();

}