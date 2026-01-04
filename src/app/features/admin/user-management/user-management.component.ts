// user-management.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
//import { SupabaseService } from '../services/supabase.service';

interface Usuario {
  id: string;
  email: string;
  role: 'admin' | 'profesor' | 'estudiante';
  nombre: string;
  apellido: string;
  telefono?: string;
  direccion?: string;
  fechaNacimiento?: Date;
  documentoIdentidad?: string;
  fotoUrl?: string;
  activo: boolean;
  createdAt: Date;
  // Datos específicos de profesor
  especialidad?: string;
  biografia?: string;
  cursosAsignados?: number;
}

interface FormularioUsuario {
  email: string;
  password: string;
  confirmarPassword: string;
  role: 'admin' | 'profesor' | 'estudiante';
  nombre: string;
  apellido: string;
  telefono: string;
  direccion: string;
  fechaNacimiento: string;
  documentoIdentidad: string;
  activo: boolean;
  // Campos adicionales para profesor
  especialidad: string;
  biografia: string;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html'
})
export class UserManagementComponent implements OnInit {
  loading = signal(true);
  error = signal<string | null>(null);
  usuarios = signal<Usuario[]>([]);
  usuariosFiltrados = signal<Usuario[]>([]);
  
  // Modal
  modalAbierto = signal(false);
  modoEdicion = signal(false);
  guardando = signal(false);
  formularioEnviado = false;
  usuarioEditando: Usuario | null = null;

  filtros = {
    busqueda: '',
    role: '',
    activo: ''
  };

  estadisticas = {
    totalUsuarios: 0,
    admins: 0,
    profesores: 0,
    estudiantes: 0
  };

  formularioUsuario: FormularioUsuario = this.inicializarFormulario();

  constructor(
    private router: Router,
    //private supabaseService: SupabaseService
  ) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  inicializarFormulario(): FormularioUsuario {
    return {
      email: '',
      password: '',
      confirmarPassword: '',
      role: 'estudiante',
      nombre: '',
      apellido: '',
      telefono: '',
      direccion: '',
      fechaNacimiento: '',
      documentoIdentidad: '',
      activo: true,
      especialidad: '',
      biografia: ''
    };
  }

  async cargarUsuarios() {
    // try {
    //   this.loading.set(true);
    //   this.error.set(null);

    //   // Llamada a Supabase
    //   const { data, error } = await this.supabaseService.client
    //     .from('profiles')
    //     .select(`
    //       *,
    //       users!inner(email, role, created_at),
    //       profesores(especialidad, biografia)
    //     `)
    //     .order('created_at', { ascending: false });

      // if (error) throw error;

      // Mapear datos
      // const usuariosMapeados: Usuario[] = data.map((item: any) => ({
      //   id: item.id,
      //   email: item.users.email,
      //   role: item.users.role,
      //   nombre: item.nombre,
      //   apellido: item.apellido,
      //   telefono: item.telefono,
      //   direccion: item.direccion,
      //   fechaNacimiento: item.fecha_nacimiento ? new Date(item.fecha_nacimiento) : undefined,
      //   documentoIdentidad: item.documento_identidad,
      //   fotoUrl: item.foto_url,
      //   activo: item.activo,
      //   createdAt: new Date(item.users.created_at),
      //   especialidad: item.profesores?.especialidad,
      //   biografia: item.profesores?.biografia,
      //   cursosAsignados: 0 // TODO: Calcular desde cursos_profesores
      // }));

    //   this.usuarios.set(usuariosMapeados);
    //   this.usuariosFiltrados.set(usuariosMapeados);
    //   this.calcularEstadisticas();

    // } catch (err: any) {
    //   this.error.set('Error al cargar usuarios: ' + err.message);
    //   console.error(err);
    // } finally {
    //   this.loading.set(false);
    // }
  }

  calcularEstadisticas() {
    const usuarios = this.usuarios();
    this.estadisticas = {
      totalUsuarios: usuarios.length,
      admins: usuarios.filter(u => u.role === 'admin').length,
      profesores: usuarios.filter(u => u.role === 'profesor').length,
      estudiantes: usuarios.filter(u => u.role === 'estudiante').length
    };
  }

  aplicarFiltros() {
    let resultado = this.usuarios();

    // Búsqueda
    if (this.filtros.busqueda) {
      const busqueda = this.filtros.busqueda.toLowerCase();
      resultado = resultado.filter(u => 
        u.nombre.toLowerCase().includes(busqueda) ||
        u.apellido.toLowerCase().includes(busqueda) ||
        u.email.toLowerCase().includes(busqueda) ||
        u.documentoIdentidad?.toLowerCase().includes(busqueda)
      );
    }

    // Filtro por rol
    if (this.filtros.role) {
      resultado = resultado.filter(u => u.role === this.filtros.role);
    }

    // Filtro por estado
    if (this.filtros.activo !== '') {
      const activo = this.filtros.activo === 'true';
      resultado = resultado.filter(u => u.activo === activo);
    }

    this.usuariosFiltrados.set(resultado);
  }

  limpiarFiltros() {
    this.filtros = {
      busqueda: '',
      role: '',
      activo: ''
    };
    this.aplicarFiltros();
  }

  // Modal
  abrirModalNuevoUsuario() {
    this.modoEdicion.set(false);
    this.usuarioEditando = null;
    this.formularioUsuario = this.inicializarFormulario();
    this.modalAbierto.set(true);
    this.formularioEnviado = false;
  }

  cerrarModal() {
    this.modalAbierto.set(false);
    this.formularioUsuario = this.inicializarFormulario();
    this.formularioEnviado = false;
  }

  onRoleChange() {
    // Si cambia el rol, resetear campos específicos
    if (this.formularioUsuario.role !== 'profesor') {
      this.formularioUsuario.especialidad = '';
      this.formularioUsuario.biografia = '';
    }
  }

  validarFormulario(): boolean {
    this.formularioEnviado = true;

    // Validaciones básicas
    if (!this.formularioUsuario.email) return false;
    if (!this.formularioUsuario.nombre) return false;
    if (!this.formularioUsuario.apellido) return false;

    // Validaciones para crear usuario
    if (!this.modoEdicion()) {
      if (!this.formularioUsuario.password) return false;
      if (this.formularioUsuario.password.length < 6) return false;
      if (this.formularioUsuario.password !== this.formularioUsuario.confirmarPassword) return false;
    }

    // Validaciones para profesor
    if (this.formularioUsuario.role === 'profesor') {
      if (!this.formularioUsuario.especialidad) return false;
    }

    return true;
  }

  async guardarUsuario() {
    if (!this.validarFormulario()) return;

    try {
      this.guardando.set(true);

      if (this.modoEdicion()) {
        await this.actualizarUsuario();
      } else {
        await this.crearUsuario();
      }

      await this.cargarUsuarios();
      this.cerrarModal();
      alert(this.modoEdicion() ? 'Usuario actualizado' : 'Usuario creado exitosamente');

    } catch (err: any) {
      console.error('Error:', err);
      alert('Error: ' + err.message);
    } finally {
      this.guardando.set(false);
    }
  }

  async crearUsuario() {
    // 1. Crear usuario en Supabase Auth
    // const { data: authData, error: authError } = await this.supabaseService.client.auth.signUp({
    //   email: this.formularioUsuario.email,
    //   password: this.formularioUsuario.password,
    //   options: {
    //     data: {
    //       role: this.formularioUsuario.role
    //     }
    //   }
    // });

    // if (authError) throw authError;
    // if (!authData.user) throw new Error('No se pudo crear el usuario');

    // 2. Crear perfil
    // const { error: profileError } = await this.supabaseService.client
    //   .from('profiles')
    //   .insert({
    //     id: authData.user.id,
    //     nombre: this.formularioUsuario.nombre,
    //     apellido: this.formularioUsuario.apellido,
    //     telefono: this.formularioUsuario.telefono || null,
    //     direccion: this.formularioUsuario.direccion || null,
    //     fecha_nacimiento: this.formularioUsuario.fechaNacimiento || null,
    //     documento_identidad: this.formularioUsuario.documentoIdentidad || null,
    //     activo: this.formularioUsuario.activo
    //   });

    // if (profileError) throw profileError;

    // 3. Si es profesor, crear registro en tabla profesores
    // if (this.formularioUsuario.role === 'profesor') {
    //   const { error: profesorError } = await this.supabaseService.client
    //     .from('profesores')
    //     .insert({
    //       id: authData.user.id,
    //       especialidad: this.formularioUsuario.especialidad,
    //       biografia: this.formularioUsuario.biografia || null
    //     });

    //   if (profesorError) throw profesorError;
    // }

    // 4. Actualizar metadata del usuario con el rol
    // const { error: updateError } = await this.supabaseService.client
    //   .from('users')
    //   .update({ role: this.formularioUsuario.role })
    //   .eq('id', authData.user.id);

    // if (updateError) throw updateError;
  }

  async actualizarUsuario() {
    // if (!this.usuarioEditando) return;

    // // Actualizar perfil
    // const { error: profileError } = await this.supabaseService.client
    //   .from('profiles')
    //   .update({
    //     nombre: this.formularioUsuario.nombre,
    //     apellido: this.formularioUsuario.apellido,
    //     telefono: this.formularioUsuario.telefono || null,
    //     direccion: this.formularioUsuario.direccion || null,
    //     fecha_nacimiento: this.formularioUsuario.fechaNacimiento || null,
    //     documento_identidad: this.formularioUsuario.documentoIdentidad || null,
    //     activo: this.formularioUsuario.activo
    //   })
    //   .eq('id', this.usuarioEditando.id);

    // if (profileError) throw profileError;

    // // Si es profesor, actualizar o crear registro
    // if (this.formularioUsuario.role === 'profesor') {
    //   const { error: profesorError } = await this.supabaseService.client
    //     .from('profesores')
    //     .upsert({
    //       id: this.usuarioEditando.id,
    //       especialidad: this.formularioUsuario.especialidad,
    //       biografia: this.formularioUsuario.biografia || null
    //     });

    //   if (profesorError) throw profesorError;
    // }
  }

  editarUsuario(usuario: Usuario) {
    this.modoEdicion.set(true);
    this.usuarioEditando = usuario;
    
    this.formularioUsuario = {
      email: usuario.email,
      password: '',
      confirmarPassword: '',
      role: usuario.role,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      telefono: usuario.telefono || '',
      direccion: usuario.direccion || '',
      fechaNacimiento: usuario.fechaNacimiento?.toISOString().split('T')[0] || '',
      documentoIdentidad: usuario.documentoIdentidad || '',
      activo: usuario.activo,
      especialidad: usuario.especialidad || '',
      biografia: usuario.biografia || ''
    };
    
    this.modalAbierto.set(true);
  }

  async cambiarEstado(usuario: Usuario) {
    const nuevoEstado = !usuario.activo;
    const mensaje = nuevoEstado ? 'activar' : 'desactivar';
    
    // if (confirm(`¿Está seguro de ${mensaje} a ${usuario.nombre} ${usuario.apellido}?`)) {
    //   try {
    //     const { error } = await this.supabaseService.client
    //       .from('profiles')
    //       .update({ activo: nuevoEstado })
    //       .eq('id', usuario.id);

    //     if (error) throw error;
        
    //     await this.cargarUsuarios();
    //     alert(`Usuario ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`);
    //   } catch (err: any) {
    //     alert('Error: ' + err.message);
    //   }
    // }
  }

  async eliminarUsuario(usuario: Usuario) {
    // if (confirm(`¿Está SEGURO de eliminar a ${usuario.nombre} ${usuario.apellido}? Esta acción NO se puede deshacer.`)) {
    //   try {
        // Primero eliminar registros relacionados
        // if (usuario.role === 'profesor') {
        //   await this.supabaseService.client
        //     .from('profesores')
        //     .delete()
        //     .eq('id', usuario.id);
        // }

        // // Eliminar perfil
        // const { error } = await this.supabaseService.client
        //   .from('profiles')
        //   .delete()
        //   .eq('id', usuario.id);

        // if (error) throw error;

        // Nota: La eliminación del usuario de Auth debe hacerse desde el admin
        // O implementar una función serverless
        
    //     await this.cargarUsuarios();
    //     alert('Usuario eliminado correctamente');
    //   } catch (err: any) {
    //     alert('Error: ' + err.message);
    //   }
    // }
  }

  verPerfil(usuario: Usuario) {
    if (usuario.role === 'profesor') {
      this.router.navigate(['/admin/profesores', usuario.id]);
    } else {
      this.router.navigate(['/admin/usuarios', usuario.id]);
    }
  }

  getRoleName(role: string): string {
    const roles: Record<string, string> = {
      'admin': 'Administrador',
      'profesor': 'Profesor',
      'estudiante': 'Estudiante'
    };
    return roles[role] || role;
  }

  volverAlDashboard() {
    this.router.navigate(['/admin/dashboard']);
  }
}