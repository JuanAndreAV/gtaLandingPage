import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment'; // ajusta la ruta

type Vista = 'lista' | 'documento' | 'existente' | 'nuevo';

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
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-management.component.html'
})
export class UserManagementComponent implements OnInit {
  private http = inject(HttpClient);
  private base = environment.baseUrl;

  readonly rolesOpciones = ['docente', 'admin', 'estudiante'];

  // ── Estado general ─────────────────────────────────────────
  vista     = signal<Vista>('lista');
  lista     = signal<any[]>([]);
  rolLista  = signal<'docente' | 'admin'>('docente');
  cargando  = signal(false);
  guardando = signal(false);
  errorMsg  = signal<string | null>(null);
  okMsg     = signal<string | null>(null);

  busqueda = signal('');
  filtrados = computed(() => {
    const t = this.busqueda().toLowerCase();
    return this.lista().filter(u =>
      !t || u.nombre_completo?.toLowerCase().includes(t) || u.documento?.includes(t));
  });

  // ── Verificar / crear ──────────────────────────────────────
  formDoc = new FormGroup({
    documento: new FormControl('', [Validators.required, Validators.minLength(5)]),
  });

  formNuevo = new FormGroup({
    documento:          new FormControl('', Validators.required),
    tipoIdentificacion: new FormControl('C.C.', Validators.required),
    nombre:             new FormControl('', Validators.required),
    apellido:           new FormControl('', Validators.required),
    telefono:           new FormControl(''),
    email:              new FormControl('', Validators.email),
    password:           new FormControl('', Validators.minLength(6)),
  });

  encontrado     = signal<any>(null);
  rolesExistente = signal<string[]>([]);
  rolesNuevo     = signal<string[]>(['docente']);

  // ── Contraseña ─────────────────────────────────────────────
  passUsuario   = signal<any>(null);
  passHecho     = signal<string | null>(null);   // contraseña ya aplicada (para copiarla)
  nuevaPassword = new FormControl('', [Validators.required, Validators.minLength(6)]);

  // ── Reasignar cursos ───────────────────────────────────────
  reasignando     = signal<any>(null);
  cursosDocente   = signal<any[]>([]);
  docentesDestino = signal<any[]>([]);
  destinoId       = new FormControl('');
  router: any;

  ngOnInit() { this.cargarLista(); }

  // ══════════════════════════ LISTA ══════════════════════════
  cargarLista(rol: 'docente' | 'admin' = this.rolLista()) {
    this.rolLista.set(rol);
    this.cargando.set(true);
    this.http.get<any>(`${this.base}/usuarios?rol=${rol}&porPagina=500`).subscribe({
      next: r => { this.lista.set(r.datos); this.cargando.set(false); },
      error: e => { this.errorMsg.set(this.mensaje(e, 'No se pudo cargar la lista')); this.cargando.set(false); },
    });
  }

  volver() {
    this.vista.set('lista');
    this.cargarLista();
  }

  // ═══════════════ VERIFICAR DOCUMENTO / ROLES ═══════════════
  iniciar() {
    this.limpiar();
    this.formDoc.reset();
    this.vista.set('documento');
  }

  verificar() {
    if (this.formDoc.invalid) return;
    const doc = this.formDoc.value.documento!.trim();
    this.limpiar();
    this.guardando.set(true);

    this.http.get<any>(`${this.base}/usuarios/verificar/${encodeURIComponent(doc)}`).subscribe({
      next: r => {
        this.guardando.set(false);
        if (r.existe) {
          this.encontrado.set(r);
          this.rolesExistente.set(r.roles ?? []);
          this.vista.set('existente');
        } else {
          this.formNuevo.reset({ documento: doc, tipoIdentificacion: 'C.C.' });
          this.rolesNuevo.set(['docente']);
          this.vista.set('nuevo');
        }
      },
      error: e => { this.guardando.set(false); this.errorMsg.set(this.mensaje(e, 'Error al verificar')); },
    });
  }

  // Cada clic manda el arreglo completo de roles
  toggleRolExistente(rol: string) {
    const u = this.encontrado();
    const actual = this.rolesExistente();
    const tiene = actual.includes(rol);
    if (tiene && !confirm(`¿Quitar el rol "${rol}" a ${u.nombre} ${u.apellido}?`)) return;

    const nuevos = tiene ? actual.filter(r => r !== rol) : [...actual, rol];
    this.limpiar();
    this.guardando.set(true);
    this.http.patch<{ roles: string[] }>(`${this.base}/usuarios/${u.id}/roles`, { roles: nuevos }).subscribe({
      next: r => {
        this.rolesExistente.set(r.roles);
        this.okMsg.set(tiene ? `Rol "${rol}" quitado.` : `Rol "${rol}" agregado.`);
        this.guardando.set(false);
      },
      error: e => { this.errorMsg.set(this.mensaje(e, 'No se pudo cambiar el rol')); this.guardando.set(false); },
    });
  }

  toggleRolNuevo(rol: string) {
    this.rolesNuevo.update(l => l.includes(rol) ? l.filter(r => r !== rol) : [...l, rol]);
  }

  crear() {
    if (this.formNuevo.invalid) { this.formNuevo.markAllAsTouched(); return; }
    if (!this.rolesNuevo().length) { this.errorMsg.set('Selecciona al menos un rol.'); return; }

    const v = this.formNuevo.value;
    const body = {
      documento: v.documento!.trim(),
      tipoIdentificacion: v.tipoIdentificacion!,
      nombre: v.nombre!.trim(),
      apellido: v.apellido!.trim(),
      roles: this.rolesNuevo(),
      ...(v.telefono?.trim() && { telefono: v.telefono.trim() }),
      ...(v.email?.trim()    && { email: v.email.trim() }),
      ...(v.password         && { password: v.password }),
    };

    this.limpiar();
    this.guardando.set(true);
    this.http.post(`${this.base}/usuarios/crear`, body).subscribe({
      next: () => {
        this.guardando.set(false);
        this.vista.set('lista');
        this.okMsg.set('Usuario creado.');
        this.cargarLista();
      },
      error: e => { this.errorMsg.set(this.mensaje(e, 'No se pudo crear')); this.guardando.set(false); },
    });
  }

  tieneNuevo     = (r: string) => this.rolesNuevo().includes(r);
  tieneExistente = (r: string) => this.rolesExistente().includes(r);

  // ═══════════════════════ CONTRASEÑA ════════════════════════
  abrirPassword(u: any) {
    this.passUsuario.set(u);
    this.passHecho.set(null);
    this.nuevaPassword.reset('');
  }

  cerrarPassword() {
    this.passUsuario.set(null);
    this.passHecho.set(null);
  }

  generarPassword() {
    const abc = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789'; // sin 0/O/1/l/I
    const bytes = crypto.getRandomValues(new Uint8Array(10));
    this.nuevaPassword.setValue(Array.from(bytes, b => abc[b % abc.length]).join(''));
  }

  guardarPassword() {
    const u = this.passUsuario();
    const pass = this.nuevaPassword.value;
    if (!u || !pass || this.nuevaPassword.invalid) return;

    this.accion(
      this.http.post(`${this.base}/usuarios/${u.id}/password`, { password: pass }),
      `Contraseña de ${u.nombre_completo} actualizada.`,
      () => this.passHecho.set(pass),
    );
  }

  copiar(texto: string) { navigator.clipboard.writeText(texto); }

  // ═══════════════════ ACTIVAR / DESACTIVAR ══════════════════
  toggleActivo(u: any) {
    const msg = u.activo
      ? `¿Desactivar a ${u.nombre_completo}? No podrá iniciar sesión.`
      : `¿Activar a ${u.nombre_completo}?`;
    if (!confirm(msg)) return;

    this.accion(
      this.http.patch(`${this.base}/usuarios/${u.id}/activo`, { activo: !u.activo }),
      u.activo ? 'Usuario desactivado.' : 'Usuario activado.',
    );
  }

  // ═══════════════════ REASIGNAR CURSOS ══════════════════════
  abrirReasignar(u: any) {
    this.reasignando.set(u);
    this.destinoId.reset('');
    this.cursosDocente.set([]);
    this.docentesDestino.set([]);

    this.http.get<any[]>(`${this.base}/cursos`, { params: { docenteId: u.id } })
      .subscribe(c => this.cursosDocente.set(c));
    this.http.get<any>(`${this.base}/usuarios?rol=docente&activo=true&porPagina=500`)
      .subscribe(r => this.docentesDestino.set(r.datos.filter((d: any) => d.id !== u.id)));
  }

  reasignar() {
    const u = this.reasignando();
    const destino = this.docentesDestino().find(d => d.id === this.destinoId.value);
    if (!u || !destino) return;
    if (!confirm(`¿Pasar ${this.cursosDocente().length} curso(s) de ${u.nombre_completo} a ${destino.nombre_completo}?`)) return;

    this.accion(
      this.http.patch<{ mensaje: string }>(`${this.base}/cursos/reasignar-docente`, {
        desdeDocenteId: u.id,
        haciaDocenteId: destino.id,
      }),
      'Cursos reasignados.',
      () => this.reasignando.set(null),
    );
  }

  // ═══════════════════════ HELPERS ═══════════════════════════
  private accion(req$: Observable<any>, ok: string, despues?: () => void) {
    this.limpiar();
    this.guardando.set(true);
    req$.subscribe({
      next: () => {
        this.okMsg.set(ok);
        this.guardando.set(false);
        despues?.();
        this.cargarLista();
      },
      error: e => { this.errorMsg.set(this.mensaje(e, 'No se pudo completar')); this.guardando.set(false); },
    });
  }

  private mensaje(e: any, defecto: string): string {
    const m = e?.error?.message;
    return Array.isArray(m) ? m.join(', ') : (m ?? defecto);
  }

  private limpiar() { this.errorMsg.set(null); this.okMsg.set(null); }

  volverAlDashboard() {
    this.router.navigate(['/admin/dashboard']);
  }
}