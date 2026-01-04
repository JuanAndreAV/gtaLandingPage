import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Profesor {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  especialidad?: string;
}

interface Horario {
  dias: string[];
  horaInicio: string;
  horaFin: string;
}

interface Curso {
  id: string;
  nombre: string;
  categoria: string;
  estado: 'activo' | 'inactivo' | 'completo';
  profesor: Profesor;
  horario: Horario;
  inscritos: number;
  capacidad: number;
  porcentajeOcupacion: number;
  promedioAsistencia: number;
  fechaInicio: Date;
  fechaFin: Date;
  nivel?: string;
  descripcion?: string;
  cuposNuevos?: number;
  edadMinima?: number;
  edadMaxima?: number;
  requiereMateriales?: boolean;
  abiertoInscripcion?: boolean;
}

interface FormularioCurso {
  nombre: string;
  categoria: string;
  nivel: string;
  descripcion: string;
  profesorId: string;
  dias: string[];
  horaInicio: string;
  horaFin: string;
  capacidadTotal: number;
  cuposNuevos: number;
  fechaInicio: string;
  fechaFin: string;
  edadMinima: number | null;
  edadMaxima: number | null;
  requiereMateriales: boolean;
  abiertoInscripcion: boolean;
}

interface Filtros {
  busqueda: string;
  categoria: string;
  estado: string;
}

interface Estadisticas {
  totalCursos: number;
  cursosActivos: number;
  totalEstudiantes: number;
  cursosCompletos: number;
}

@Component({
  selector: 'app-course-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './course-management.component.html'
})
export class CourseManagementComponent implements OnInit {
  loading = signal(true);
  error = signal<string | null>(null);
  cursos = signal<Curso[]>([]);
  cursosFiltrados = signal<Curso[]>([]);
  menuAbierto: string | null = null;
  
  // Modal
  modalAbierto = signal(false);
  modoEdicion = signal(false);
  guardando = signal(false);
  formularioEnviado = false;
  cursoEditando: Curso | null = null;

  filtros: Filtros = {
    busqueda: '',
    categoria: '',
    estado: ''
  };

  estadisticas: Estadisticas = {
    totalCursos: 0,
    cursosActivos: 0,
    totalEstudiantes: 0,
    cursosCompletos: 0
  };

  formularioCurso: FormularioCurso = {
    nombre: '',
    categoria: '',
    nivel: '',
    descripcion: '',
    profesorId: '',
    dias: [],
    horaInicio: '',
    horaFin: '',
    capacidadTotal: 20,
    cuposNuevos: 0,
    fechaInicio: '',
    fechaFin: '',
    edadMinima: null,
    edadMaxima: null,
    requiereMateriales: false,
    abiertoInscripcion: true
  };

  diasSemana = [
    { valor: 'Lunes', nombre: 'Lunes' },
    { valor: 'Martes', nombre: 'Martes' },
    { valor: 'Miércoles', nombre: 'Miércoles' },
    { valor: 'Jueves', nombre: 'Jueves' },
    { valor: 'Viernes', nombre: 'Viernes' },
    { valor: 'Sábado', nombre: 'Sábado' },
    { valor: 'Domingo', nombre: 'Domingo' }
  ];

  profesoresDisponibles: (Profesor & { especialidad: string })[] = [
    { id: 'p1', nombre: 'Carlos', apellido: 'Martínez', email: 'carlos@example.com', especialidad: 'Música' },
    { id: 'p2', nombre: 'María', apellido: 'González', email: 'maria@example.com', especialidad: 'Danza' },
    { id: 'p3', nombre: 'Laura', apellido: 'Ramírez', email: 'laura@example.com', especialidad: 'Teatro' },
    { id: 'p4', nombre: 'Roberto', apellido: 'Silva', email: 'roberto@example.com', especialidad: 'Artes Plásticas' },
    { id: 'p5', nombre: 'Ana', apellido: 'Torres', email: 'ana@example.com', especialidad: 'Literatura' }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    this.cargarCursos();
    this.cargarProfesores();
  }

  async cargarCursos() {
    try {
      this.loading.set(true);
      this.error.set(null);

      // Aquí harías la llamada real a tu servicio
      // const response = await this.cursoService.obtenerTodos();
      
      // Datos de ejemplo
      const cursosEjemplo: Curso[] = [
        {
          id: '1',
          nombre: 'Guitarra Nivel Básico',
          categoria: 'Música',
          estado: 'activo',
          nivel: 'Principiante',
          descripcion: 'Aprende los fundamentos de la guitarra',
          profesor: {
            id: 'p1',
            nombre: 'Carlos',
            apellido: 'Martínez',
            email: 'carlos@example.com'
          },
          horario: {
            dias: ['Lunes', 'Miércoles'],
            horaInicio: '14:00',
            horaFin: '16:00'
          },
          inscritos: 18,
          capacidad: 20,
          porcentajeOcupacion: 90,
          promedioAsistencia: 85,
          fechaInicio: new Date('2024-01-15'),
          fechaFin: new Date('2024-06-30'),
          cuposNuevos: 5,
          edadMinima: 10,
          edadMaxima: 99,
          requiereMateriales: true,
          abiertoInscripcion: true
        },
        {
          id: '2',
          nombre: 'Danza Folclórica',
          categoria: 'Danza',
          estado: 'activo',
          nivel: 'Todos los niveles',
          profesor: {
            id: 'p2',
            nombre: 'María',
            apellido: 'González',
            email: 'maria@example.com'
          },
          horario: {
            dias: ['Martes', 'Jueves'],
            horaInicio: '16:00',
            horaFin: '18:00'
          },
          inscritos: 25,
          capacidad: 25,
          porcentajeOcupacion: 100,
          promedioAsistencia: 92,
          fechaInicio: new Date('2024-01-10'),
          fechaFin: new Date('2024-06-25'),
          cuposNuevos: 8,
          abiertoInscripcion: false
        }
      ];

      this.cursos.set(cursosEjemplo);
      this.cursosFiltrados.set(cursosEjemplo);
      this.calcularEstadisticas();

    } catch (err) {
      this.error.set('Error al cargar los cursos. Por favor, intenta nuevamente.');
      console.error(err);
    } finally {
      this.loading.set(false);
    }
  }

  async cargarProfesores() {
    // Aquí cargarías los profesores desde tu servicio
    // const profesores = await this.profesorService.obtenerDisponibles();
    // this.profesoresDisponibles = profesores;
  }

  calcularEstadisticas() {
    const cursos = this.cursos();
    this.estadisticas = {
      totalCursos: cursos.length,
      cursosActivos: cursos.filter(c => c.estado === 'activo').length,
      totalEstudiantes: cursos.reduce((sum, c) => sum + c.inscritos, 0),
      cursosCompletos: cursos.filter(c => c.porcentajeOcupacion >= 100).length
    };
  }

  aplicarFiltros() {
    let resultado = this.cursos();

    if (this.filtros.busqueda) {
      const busqueda = this.filtros.busqueda.toLowerCase();
      resultado = resultado.filter(c => 
        c.nombre.toLowerCase().includes(busqueda) ||
        c.profesor.nombre.toLowerCase().includes(busqueda) ||
        c.profesor.apellido.toLowerCase().includes(busqueda)
      );
    }

    if (this.filtros.categoria) {
      resultado = resultado.filter(c => c.categoria === this.filtros.categoria);
    }

    if (this.filtros.estado) {
      if (this.filtros.estado === 'completo') {
        resultado = resultado.filter(c => c.porcentajeOcupacion >= 100);
      } else {
        resultado = resultado.filter(c => c.estado === this.filtros.estado);
      }
    }

    this.cursosFiltrados.set(resultado);
  }

  limpiarFiltros() {
    this.filtros = {
      busqueda: '',
      categoria: '',
      estado: ''
    };
    this.aplicarFiltros();
  }

  toggleMenu(cursoId: string) {
    this.menuAbierto = this.menuAbierto === cursoId ? null : cursoId;
  }

  // Modal
  abrirModalNuevoCurso() {
    this.modoEdicion.set(false);
    this.cursoEditando = null;
    this.resetearFormulario();
    this.modalAbierto.set(true);
    this.formularioEnviado = false;
  }

  cerrarModal() {
    this.modalAbierto.set(false);
    this.resetearFormulario();
    this.formularioEnviado = false;
  }

  resetearFormulario() {
    this.formularioCurso = {
      nombre: '',
      categoria: '',
      nivel: '',
      descripcion: '',
      profesorId: '',
      dias: [],
      horaInicio: '',
      horaFin: '',
      capacidadTotal: 20,
      cuposNuevos: 0,
      fechaInicio: '',
      fechaFin: '',
      edadMinima: null,
      edadMaxima: null,
      requiereMateriales: false,
      abiertoInscripcion: true
    };
  }

  toggleDia(dia: string) {
    const index = this.formularioCurso.dias.indexOf(dia);
    if (index > -1) {
      this.formularioCurso.dias.splice(index, 1);
    } else {
      if (this.formularioCurso.dias.length < 2) {
        this.formularioCurso.dias.push(dia);
      }
    }
  }

  validarFormulario(): boolean {
    this.formularioEnviado = true;

    if (!this.formularioCurso.nombre) return false;
    if (!this.formularioCurso.categoria) return false;
    if (!this.formularioCurso.profesorId) return false;
    if (this.formularioCurso.dias.length === 0) return false;
    if (!this.formularioCurso.horaInicio) return false;
    if (!this.formularioCurso.horaFin) return false;
    if (this.formularioCurso.horaInicio >= this.formularioCurso.horaFin) return false;
    if (!this.formularioCurso.capacidadTotal) return false;
    if (!this.formularioCurso.fechaInicio) return false;
    if (!this.formularioCurso.fechaFin) return false;
    if (this.formularioCurso.fechaInicio >= this.formularioCurso.fechaFin) return false;
    if (this.formularioCurso.cuposNuevos > this.formularioCurso.capacidadTotal) return false;

    return true;
  }

  async guardarCurso() {
    if (!this.validarFormulario()) {
      return;
    }

    try {
      this.guardando.set(true);

      // Aquí harías la llamada a tu servicio
      if (this.modoEdicion()) {
        // await this.cursoService.actualizar(this.cursoEditando.id, this.formularioCurso);
        console.log('Actualizando curso:', this.formularioCurso);
      } else {
        // await this.cursoService.crear(this.formularioCurso);
        console.log('Creando nuevo curso:', this.formularioCurso);
      }

      // Recargar cursos
      await this.cargarCursos();
      
      // Cerrar modal
      this.cerrarModal();
      
      // Mostrar mensaje de éxito
      alert(this.modoEdicion() ? 'Curso actualizado exitosamente' : 'Curso creado exitosamente');

    } catch (err) {
      console.error('Error al guardar curso:', err);
      alert('Error al guardar el curso. Por favor, intenta nuevamente.');
    } finally {
      this.guardando.set(false);
    }
  }

  // Navegación
  volverAlDashboard() {
    this.router.navigate(['/admin/dashboard']);
  }

  verDetallesCurso(cursoId: string) {
    this.router.navigate(['/admin/cursos', cursoId]);
  }

  gestionarAsistencia(cursoId: string) {
    this.router.navigate(['/admin/cursos', cursoId, 'asistencia']);
  }

  verPerfilProfesor(profesorId: string) {
    this.router.navigate(['/admin/profesores', profesorId]);
  }

  // Acciones CRUD
  editarCurso(curso: Curso) {
    this.menuAbierto = null;
    this.modoEdicion.set(true);
    this.cursoEditando = curso;
    
    // Cargar datos en el formulario
    this.formularioCurso = {
      nombre: curso.nombre,
      categoria: curso.categoria,
      nivel: curso.nivel || '',
      descripcion: curso.descripcion || '',
      profesorId: curso.profesor.id,
      dias: [...curso.horario.dias],
      horaInicio: curso.horario.horaInicio,
      horaFin: curso.horario.horaFin,
      capacidadTotal: curso.capacidad,
      cuposNuevos: curso.cuposNuevos || 0,
      fechaInicio: curso.fechaInicio.toISOString().split('T')[0],
      fechaFin: curso.fechaFin.toISOString().split('T')[0],
      edadMinima: curso.edadMinima || null,
      edadMaxima: curso.edadMaxima || null,
      requiereMateriales: curso.requiereMateriales || false,
      abiertoInscripcion: curso.abiertoInscripcion ?? true
    };
    
    this.modalAbierto.set(true);
  }

  async cambiarEstado(curso: Curso) {
    this.menuAbierto = null;
    const nuevoEstado = curso.estado === 'activo' ? 'inactivo' : 'activo';
    
    if (confirm(`¿Cambiar el estado del curso "${curso.nombre}" a ${nuevoEstado}?`)) {
      // await this.cursoService.cambiarEstado(curso.id, nuevoEstado);
      console.log('Cambiar estado:', curso, nuevoEstado);
      await this.cargarCursos();
    }
  }

  async duplicarCurso(curso: Curso) {
    this.menuAbierto = null;
    if (confirm(`¿Duplicar el curso "${curso.nombre}"?`)) {
      // await this.cursoService.duplicar(curso.id);
      console.log('Duplicar curso:', curso);
      await this.cargarCursos();
    }
  }

  async eliminarCurso(curso: Curso) {
    this.menuAbierto = null;
    if (confirm(`¿Estás seguro de eliminar el curso "${curso.nombre}"? Esta acción no se puede deshacer.`)) {
      // await this.cursoService.eliminar(curso.id);
      console.log('Eliminar curso:', curso);
      await this.cargarCursos();
    }
  }
}
