// src/app/features/admin/academico/inscripciones/inscripciones-admin.component.ts
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InscripcionesService } from '../../../../services/gestion-academica/inscripciones.service';
import { UsuariosAdminService, VerificacionUsuario } from '../../../../services/gestion-academica/usuarios-admin.service';
import { CursosService } from '../../../../services/gestion-academica/cursos.service';
import { ProgramasService } from '../../../../services/gestion-academica/programas.service';
import { AsignaturasService } from '../../../../services/gestion-academica/asignatura.service';
import { Inscripcion, EstadoInscripcion } from '../../../../models/gestion-academica/inscripcion';
import { RegistroEstudianteCompleto } from '../../../../models/gestion-academica/registro-estudiante';
import { AreaArtistica } from '../../../../models/gestion-academica/programa';

type Tab = 'pendientes' | 'inscribir';
type ModoPerfil = 'nuevo' | 'completar';

@Component({
  selector: 'app-inscripciones-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inscripciones.component.html',
})
export class InscripcionesComponent implements OnInit {
  inscripcionesService = inject(InscripcionesService);
  usuariosAdminService = inject(UsuariosAdminService);
  cursosService = inject(CursosService);
  programasService = inject(ProgramasService);
  asignaturasService = inject(AsignaturasService);

  tab = signal<Tab>('pendientes');
  areas = Object.values(AreaArtistica);

  // ── Pestaña: Pendientes ─────────────────────────────────
  procesando = signal<string | null>(null);

  // ── Pestaña: Inscribir — búsqueda por documento ──────────
  documentoBusqueda = signal('');
  buscando = signal(false);
  resultadoBusqueda = signal<VerificacionUsuario | null>(null);
  errorBusqueda = signal<string | null>(null);

  // ── Pestaña: Inscribir — filtros en cascada para el curso ──
  filtroArea = signal<string>('');
  filtroProgramaInscribir = signal<string>('');
  filtroAsignaturaInscribir = signal<string>('');
  filtroPeriodoInscribir = signal<string>('');
  cursoSeleccionado = signal<string>('');
  observaciones = signal('');
  inscribiendo = signal(false);
  mensajeInscripcion = signal<string | null>(null);
  errorInscripcion = signal<string | null>(null);

  // Programas visibles según el área elegida
  programasFiltrados = computed(() => {
    const area = this.filtroArea();
    const todos = this.programasService.programas();
    return area ? todos.filter(p => p.area === area) : todos;
  });

  // Asignaturas visibles según el programa elegido o el área seleccionada
  asignaturasFiltradas = computed(() => {
    const area = this.filtroArea();
    const programaId = this.filtroProgramaInscribir();
    const todas = this.asignaturasService.asignaturas();

    if (programaId) {
      return todas.filter(a => a.pensum?.some(p => p.programaId === programaId));
    }

    if (area) {
      const programasDelArea = new Set(
        this.programasService.programas().filter(p => p.area === area).map(p => p.id)
      );
      return todas.filter(a => a.pensum?.some(p => programasDelArea.has(p.programaId)));
    }

    return todas;
  });

  // Cursos visibles según periodo + asignatura elegidos
  cursosDelPeriodo = computed(() => {
    const periodo = this.filtroPeriodoInscribir();
    const asignaturaId = this.filtroAsignaturaInscribir();
    let cursos = this.cursosService.cursos();

    if (periodo) cursos = cursos.filter(c => c.periodoId === periodo);
    if (asignaturaId) cursos = cursos.filter(c => c.asignaturaId === asignaturaId);

    return cursos;
  });

  // ── Pestaña: Inscribir — registro / completar perfil ─────
  mostrarFormularioPerfil = signal(false);
  modoPerfil = signal<ModoPerfil>('nuevo');
  guardandoPerfil = signal(false);
  errorPerfil = signal<string | null>(null);
  usuarioCreadoParcial = signal(false);

  formRegistro: RegistroEstudianteCompleto = this.formRegistroVacio();

  ngOnInit() {
    this.inscripcionesService.listarPendientes().subscribe();
    this.cursosService.listar().subscribe();
    this.programasService.listarProgramas().subscribe();
    this.programasService.listarPeriodos().subscribe();
    this.asignaturasService.listar().subscribe();
  }

  private formRegistroVacio(): RegistroEstudianteCompleto {
    return {
      nombre: '',
      apellido: '',
      documento: '',
      password: '',
      email: '',
      segundoNombre: '',
      segundoApellido: '',
      tipoIdentificacion: '',
      telefono: '',
      fechaNacimiento: '',
      direccion: '',
      barrio: '',
      municipio: '',
      departamento: '',
      pais: 'Colombia',
      municipioNacimiento: '',
      departamentoNacimiento: '',
      paisNacimiento: '',
      genero: '',
      zonaResidencia: '',
      enfoquePoblacional: '',
      tieneDiscapacidad: false,
      tipoDiscapacidad: '',
      estrato: undefined,
      eps: '',
      acudienteNombre: '',
      acudienteTelefono: '',
      acudienteParentesco: '',
    };
  }

  cambiarTab(t: Tab) {
    this.tab.set(t);
    if (t === 'pendientes') this.inscripcionesService.listarPendientes().subscribe();
  }

  // ── Cambios en los selectores de filtro ─────────────────
  onAreaChange() {
    this.filtroProgramaInscribir.set('');
    this.filtroAsignaturaInscribir.set('');
    this.cursoSeleccionado.set('');
  }

  onProgramaChange() {
    this.filtroAsignaturaInscribir.set('');
    this.cursoSeleccionado.set('');
  }

  onAsignaturaChange() {
    this.cursoSeleccionado.set('');
  }

  // ── Pendientes: acciones ────────────────────────────────
  aprobar(inscripcion: Inscripcion) {
    this.procesando.set(inscripcion.id);
    this.inscripcionesService.aprobar(inscripcion.id).subscribe({
      next: () => {
        this.procesando.set(null);
        this.inscripcionesService.listarPendientes().subscribe();
      },
      error: (err) => {
        this.procesando.set(null);
        alert(err.error?.message ?? 'Error al aprobar la inscripción');
      },
    });
  }

  rechazar(inscripcion: Inscripcion) {
    if (!confirm('¿Rechazar esta pre-inscripción? Quedará marcada como retirada.')) return;
    this.procesando.set(inscripcion.id);
    this.inscripcionesService.cambiarEstado(inscripcion.id, { estado: EstadoInscripcion.RETIRADA }).subscribe({
      next: () => {
        this.procesando.set(null);
        this.inscripcionesService.listarPendientes().subscribe();
      },
      error: (err) => {
        this.procesando.set(null);
        alert(err.error?.message ?? 'Error al rechazar la inscripción');
      },
    });
  }

  // ── Búsqueda por documento ────────────────────────────────
  buscarPorDocumento() {
    const doc = this.documentoBusqueda().trim();
    if (!doc) return;

    this.buscando.set(true);
    this.errorBusqueda.set(null);
    this.resultadoBusqueda.set(null);
    this.mensajeInscripcion.set(null);
    this.mostrarFormularioPerfil.set(false);
    this.usuarioCreadoParcial.set(false);

    this.usuariosAdminService.verificarDocumento(doc).subscribe({
      next: (res) => {
        this.buscando.set(false);
        this.resultadoBusqueda.set(res);

        if (!res.existe) {
          this.modoPerfil.set('nuevo');
          this.formRegistro = { ...this.formRegistroVacio(), documento: doc, password: doc };
          this.errorBusqueda.set(res.mensaje ?? 'Documento no encontrado.');
        } else if (!res.perfilCompleto) {
          this.modoPerfil.set('completar');
          this.precargarFormularioDesdeExistente(res);
        }
      },
      error: (err) => {
        this.buscando.set(false);
        this.errorBusqueda.set(err.error?.message ?? 'Error al verificar el documento');
      },
    });
  }

  private precargarFormularioDesdeExistente(usuario: VerificacionUsuario) {
    const perfil = (usuario as any).perfil ?? {};
    this.formRegistro = {
      nombre: usuario.nombre ?? '',
      apellido: usuario.apellido ?? '',
      documento: usuario.documento ?? '',
      password: '',
      email: usuario.emailFicticio ? '' : (usuario.email ?? ''),
      segundoNombre: perfil.segundo_nombre ?? '',
      segundoApellido: perfil.segundo_apellido ?? '',
      tipoIdentificacion: perfil.tipo_identificacion ? String(perfil.tipo_identificacion) : '',
      telefono: usuario.telefono ?? '',
      fechaNacimiento: usuario.fechaNacimiento ? usuario.fechaNacimiento.toString().split('T')[0] : '',
      direccion: perfil.direccion ?? '',
      barrio: perfil.barrio ?? '',
      municipio: perfil.municipio ?? '',
      departamento: perfil.departamento ?? '',
      pais: perfil.pais ?? 'Colombia',
      municipioNacimiento: perfil.municipio_nacimiento ?? '',
      departamentoNacimiento: perfil.departamento_nacimiento ?? '',
      paisNacimiento: perfil.pais_nacimiento ?? '',
      genero: perfil.genero ?? '',
      zonaResidencia: perfil.zona_residencia ?? '',
      enfoquePoblacional: perfil.enfoque_poblacional ?? '',
      tieneDiscapacidad: perfil.tiene_discapacidad ?? false,
      tipoDiscapacidad: perfil.tipo_discapacidad ?? '',
      estrato: perfil.estrato ? Number(perfil.estrato) : undefined,
      eps: perfil.eps ?? '',
      acudienteNombre: perfil.acudiente_nombre ?? '',
      acudienteTelefono: perfil.acudiente_telefono ?? '',
      acudienteParentesco: perfil.acudiente_parentesco ?? '',
    };
  }

  abrirFormularioPerfil() {
    this.mostrarFormularioPerfil.set(true);
    this.errorPerfil.set(null);
    this.usuarioCreadoParcial.set(false);
  }

  guardarPerfil() {
  this.errorPerfil.set(null);

  if (!this.formRegistro.nombre || !this.formRegistro.apellido || !this.formRegistro.documento) {
    this.errorPerfil.set('Nombre, apellido y documento son requeridos.');
    return;
  }
 
  this.guardandoPerfil.set(true);

  if (this.modoPerfil() === 'nuevo') {
    // Saneamiento del DTO para evitar rechazos del ValidationPipe de NestJS
    const payloadRegistro = {
  ...this.formRegistro,
  roles: ['estudiante'], // Asignas la propiedad que espera tu CrearUsuarioDto
  tipoIdentificacion: String(this.formRegistro.tipoIdentificacion || ''),
  estrato: this.formRegistro.estrato ? Number(this.formRegistro.estrato) : undefined,
};

    this.usuariosAdminService.registrarEstudianteCompleto(payloadRegistro).subscribe({
      next: () => {
        this.guardandoPerfil.set(false);
        this.mostrarFormularioPerfil.set(false);
        this.buscarPorDocumento();
      },
      error: (err) => {
        this.guardandoPerfil.set(false);
        this.usuarioCreadoParcial.set(true);
        this.errorPerfil.set(
          err.error?.message ?? 'El usuario pudo haberse creado, pero falló el perfil. Busca de nuevo para confirmar.'
        );
      },
    });
  } else {
    const usuario = this.resultadoBusqueda();
    if (!usuario?.id) return;

    const { nombre: _n, apellido: _a, documento: _d, password: _p, email: _e, role: _r, ...perfil } = this.formRegistro as any;

    const payloadPerfil = {
      ...perfil,
      tipoIdentificacion: String(perfil.tipoIdentificacion || ''),
      estrato: perfil.estrato ? Number(perfil.estrato) : undefined,
    };

    this.usuariosAdminService.completarPerfil(usuario.id, payloadPerfil).subscribe({
      next: () => {
        this.guardandoPerfil.set(false);
        this.mostrarFormularioPerfil.set(false);
        this.buscarPorDocumento();
      },
      error: (err) => {
        this.guardandoPerfil.set(false);
        this.errorPerfil.set(err.error?.message ?? 'Error al actualizar el perfil');
      },
    });
  }
}

  // ── Inscripción al curso ──────────────────────────────────
  inscribir() {
    const usuario = this.resultadoBusqueda();
    const cursoId = this.cursoSeleccionado();
    if (!usuario?.existe || !usuario.id || !cursoId) return;

    this.inscribiendo.set(true);
    this.errorInscripcion.set(null);
    this.mensajeInscripcion.set(null);

    this.inscripcionesService.inscribirDirecto({
      usuarioId: usuario.id,
      cursoId,
      observaciones: this.observaciones() || undefined,
    }).subscribe({
      next: () => {
        this.inscribiendo.set(false);
        this.mensajeInscripcion.set('Inscripción registrada correctamente.');
        this.cursoSeleccionado.set('');
        this.observaciones.set('');
      },
      error: (err) => {
        this.inscribiendo.set(false);
        this.errorInscripcion.set(err.error?.message ?? 'Error al inscribir');
      },
    });
  }

  limpiarBusqueda() {
    this.documentoBusqueda.set('');
    this.resultadoBusqueda.set(null);
    this.errorBusqueda.set(null);
    this.mensajeInscripcion.set(null);
    this.cursoSeleccionado.set('');
    this.mostrarFormularioPerfil.set(false);
  }

  claseBadgeEstado(estado: EstadoInscripcion): string {
    switch (estado) {
      case EstadoInscripcion.ACTIVA: return 'bg-emerald-100 text-emerald-700';
      case EstadoInscripcion.PENDIENTE: return 'bg-amber-100 text-amber-700';
      case EstadoInscripcion.EN_ESPERA: return 'bg-sky-100 text-sky-700';
      case EstadoInscripcion.RETIRADA: return 'bg-red-100 text-red-700';
      case EstadoInscripcion.SUSPENDIDA: return 'bg-orange-100 text-orange-700';
      case EstadoInscripcion.FINALIZADA: return 'bg-gray-200 text-gray-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  }

  etiquetaEstado(estado: EstadoInscripcion): string {
    const etiquetas: Record<EstadoInscripcion, string> = {
      [EstadoInscripcion.PENDIENTE]: 'Pendiente',
      [EstadoInscripcion.ACTIVA]: 'Activa',
      [EstadoInscripcion.EN_ESPERA]: 'En espera',
      [EstadoInscripcion.RETIRADA]: 'Retirada',
      [EstadoInscripcion.SUSPENDIDA]: 'Suspendida',
      [EstadoInscripcion.FINALIZADA]: 'Finalizada',
    };
    return etiquetas[estado] ?? estado;
  }
}