import { Component, OnInit, signal,inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule} from '@angular/common';
import { UserService } from '../../../services/user.service';
import { FormsModule } from '@angular/forms';
import { Usuario, CreateUsuarioDto, UpdateUsuarioDto } from '../../../models/user';

interface FormularioUsuario {
  email: string;
  password: string;
  confirmarPassword: string;
  nombre: string;
  role: 'admin' | 'profesor';
}


@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html'
})
export class UserManagementComponent implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);


  loading = signal(true);
  error = signal<string | null>(null);
  usuarios = signal<Usuario[]>([]);
  usuariosFiltrados = signal<Usuario[]>([]);
  
  modalAbierto = signal(false);
  modoEdicion = signal(false);
  guardando = signal(false);
  formularioEnviado = false;
  usuarioEditando: Usuario | null = null;

  filtros = {
    busqueda: '',
    role: ''
  };

  estadisticas = {
    totalUsuarios: 0,
    admins: 0,
    profesores: 0
  };

  formularioUsuario: FormularioUsuario = this.inicializarFormulario();

 

  ngOnInit() {
    this.cargarUsuarios();
  }

  inicializarFormulario(): FormularioUsuario {
    return {
      email: '',
      password: '',
      confirmarPassword: '',
      nombre: '',
      role: 'profesor'
    };
  }

  cargarUsuarios() {
    this.loading.set(true);
    this.error.set(null);

    this.userService.getAll().subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios);
        this.usuariosFiltrados.set(usuarios);
        this.calcularEstadisticas();
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar usuarios: ' + (err.error?.message || err.message));
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  calcularEstadisticas() {
    const usuarios = this.usuarios();
    this.estadisticas = {
      totalUsuarios: usuarios.length,
      admins: usuarios.filter(u => u.role === 'admin').length,
      profesores: usuarios.filter(u => u.role === 'profesor').length
    };
  }

  aplicarFiltros() {
    let resultado = this.usuarios();

    if (this.filtros.busqueda) {
      const busqueda = this.filtros.busqueda.toLowerCase();
      resultado = resultado.filter(u => 
        u.email.toLowerCase().includes(busqueda) ||
        u.nombre.toLowerCase().includes(busqueda)
      );
    }

    if (this.filtros.role) {
      resultado = resultado.filter(u => u.role === this.filtros.role);
    }

    this.usuariosFiltrados.set(resultado);
  }

  limpiarFiltros() {
    this.filtros = {
      busqueda: '',
      role: ''
    };
    this.aplicarFiltros();
  }

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

  validarFormulario(): boolean {
    this.formularioEnviado = true;

    if (!this.formularioUsuario.email) return false;
    if (!this.formularioUsuario.nombre) return false;
    
    if (!this.modoEdicion()) {
      if (!this.formularioUsuario.password) return false;
      if (this.formularioUsuario.password.length < 6) return false;
      if (this.formularioUsuario.password !== this.formularioUsuario.confirmarPassword) return false;
    }

    return true;
  }

  guardarUsuario() {
    if (!this.validarFormulario()) return;

    this.guardando.set(true);

    if (this.modoEdicion()) {
      this.actualizarUsuario();
    } else {
      this.crearUsuario();
    }
  }

  crearUsuario() {
    const data: CreateUsuarioDto = {
      email: this.formularioUsuario.email,
      password: this.formularioUsuario.password,
      nombre: this.formularioUsuario.nombre,
      role: this.formularioUsuario.role
    };

    this.userService.create(data).subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarModal();
        this.cargarUsuarios();
        alert('Usuario creado exitosamente');
      },
      error: (err) => {
        this.guardando.set(false);
        alert('Error al crear usuario: ' + (err.error?.message || err.message));
        console.error(err);
      }
    });
  }

  actualizarUsuario() {
    if (!this.usuarioEditando) return;

    const data = {
      email: this.formularioUsuario.email,
      nombre: this.formularioUsuario.nombre,
      role: this.formularioUsuario.role
    };

    this.userService.update(this.usuarioEditando.id, data).subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarModal();
        this.cargarUsuarios();
        alert('Usuario actualizado exitosamente');
      },
      error: (err) => {
        this.guardando.set(false);
        alert('Error al actualizar usuario: ' + (err.error?.message || err.message));
        console.error(err);
      }
    });
  }

  editarUsuario(usuario: Usuario) {
    this.modoEdicion.set(true);
    this.usuarioEditando = usuario;
    
    this.formularioUsuario = {
      email: usuario.email,
      password: '',
      confirmarPassword: '',
      nombre: usuario.nombre,
      role: usuario.role
    };
    
    this.modalAbierto.set(true);
  }

  eliminarUsuario(usuario: Usuario) {
    if (confirm(`¿Está SEGURO de eliminar a ${usuario.nombre}? Esta acción NO se puede deshacer.`)) {
      this.userService.delete(usuario.id).subscribe({
        next: () => {
          this.cargarUsuarios();
          alert('Usuario eliminado correctamente');
        },
        error: (err) => {
          alert('Error al eliminar: ' + (err.error?.message || err.message));
        }
      });
    }
  }

  getRoleName(role: string): string {
    return role === 'admin' ? 'Administrador' : 'Profesor';
  }

  volverAlDashboard() {
    this.router.navigate(['/admin/dashboard']);
  }
}