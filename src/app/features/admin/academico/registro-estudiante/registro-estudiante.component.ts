import {
  Component, inject, signal, computed, OnInit, Input, Output, EventEmitter
} from '@angular/core';
import {
  FormBuilder, FormGroup, Validators,
  ReactiveFormsModule, AbstractControl
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { UbicacionService } from '../../../../services/gestion-academica/ubicacion.service';
import { UsuariosAdminService } from '../../../../services/gestion-academica/usuarios-admin.service';

type Paso = 'documento' | 'datos' | 'listo';

@Component({
  selector: 'app-registro-estudiante',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registro-estudiante.component.html',
})
export class RegistroEstudianteComponent implements OnInit {
  private fb            = inject(FormBuilder);
  private router        = inject(Router);
  ubicacion             = inject(UbicacionService);
  usuariosAdmin         = inject(UsuariosAdminService);

  @Input() documentoInicial: string = '';
  @Input() esModal: boolean = false;
  @Output() registrado = new EventEmitter<{ usuarioId: string; documento: string }>();
  @Output() cancelado = new EventEmitter<void>();

  paso      = signal<Paso>('documento');
  guardando = signal(false);
  errorMsg  = signal<string | null>(null);
  usuarioId = signal<string | null>(null);
  esNuevo   = signal(true);
  rolesExistentes = signal<string[]>([]); // roles que YA tenía el usuario, para no perderlos al guardar

  formDoc = this.fb.group({
    documento: ['', [Validators.required, Validators.minLength(5)]],
  });

  form: FormGroup = this.fb.group({
    tipoIdentificacion: ['C.C.', Validators.required],
    nombre:             ['', Validators.required],
    segundoNombre:      [''],
    apellido:           ['', Validators.required],
    segundoApellido:    [''],
    documento:          ['', Validators.required],
    genero:             [''],
    fechaNacimiento:    ['', Validators.required],
    telefono:           [''],
    email:              [''],
    password:           [''],

    departamentoId:     [''],
    departamento:       ['', Validators.required],
    municipioId:        [''],
    municipio:          ['', Validators.required],
    direccion:          [''],
    barrio:             [''],
    zonaResidencia:     ['', Validators.required],
    pais:               ['Colombia'],

    departamentoNacId:  [''],
    departamentoNacimiento: [''],
    municipioNacId:     [''],
    municipioNacimiento: [''],
    paisNacimiento:     ['Colombia'],

    enfoquePoblacional: ['', Validators.required],
    tieneDiscapacidad:  [false],
    tipoDiscapacidad:   [''],
    estrato:            [''],
    eps:                [''],

    acudienteNombre:       [''],
    acudienteTelefono:     [''],
    acudienteParentesco:   [''],

    role: [['estudiante']],
  });

  tiposId       = ['C.C.', 'T.I.', 'C.E.', 'Pasaporte', 'R.C.N', 'Otro'];
  generos       = ['Masculino', 'Femenino', 'No binario', 'Otro'];
  zonas         = ['Urbana', 'Rural'];
  enfoques      = ['No aplica', 'Víctimas', 'ICBF', 'Discapacidad', 'LGBTIQ+', 'Adulto mayor', 'Primera infancia', 'Indigena', 'Comunidades Afrodescendientes','Raizal','Palenquero', 'Gitano'];
  estratos      = [1, 2, 3, 4, 5, 6];
  rolesOpciones = ['estudiante', 'docente', 'admin'];

  esMinorEdad = computed(() => {
    const fecha = this.form.get('fechaNacimiento')?.value;
    if (!fecha) return false;
    const edad = this.calcularEdad(new Date(fecha));
    return edad < 18;
  });

  tieneDiscapacidad = computed(() =>
    this.form.get('tieneDiscapacidad')?.value === true
  );

  ngOnInit() {
    this.ubicacion.getDepartamentos().subscribe();

    if (this.documentoInicial) {
      this.formDoc.patchValue({ documento: this.documentoInicial });
      this.verificarDocumento();
    }
  }

  private resetearFormulario() {
    this.usuarioId.set(null);
    this.errorMsg.set(null);
    this.form.reset({
      tipoIdentificacion: 'C.C.',
      nombre: '', segundoNombre: '', apellido: '', segundoApellido: '',
      documento: '', genero: '', fechaNacimiento: '', telefono: '', email: '', password: '',
      departamentoId: '', departamento: '', municipioId: '', municipio: '',
      direccion: '', barrio: '', zonaResidencia: '', pais: 'Colombia',
      departamentoNacId: '', departamentoNacimiento: '',
      municipioNacId: '', municipioNacimiento: '', paisNacimiento: 'Colombia',
      enfoquePoblacional: '', tieneDiscapacidad: false, tipoDiscapacidad: '',
      estrato: '', eps: '',
      acudienteNombre: '', acudienteTelefono: '', acudienteParentesco: '',
      role: ['estudiante'],
    });
  }

  // ----------------------------------------------------------------
  // PASO 1: Verificar documento
  // ----------------------------------------------------------------
  verificarDocumento() {
    if (this.formDoc.invalid) return;
    const doc = this.formDoc.get('documento')!.value!.trim();

    this.usuariosAdmin.verificarDocumento(doc).subscribe({
      next: (res) => {
        this.resetearFormulario();

        if (res.existe) {
          this.usuarioId.set(res.id ?? null);
          this.esNuevo.set(false);
          this.rolesExistentes.set(res.roles ?? []);

          this.form.patchValue({
            nombre:             res.nombre ?? '',
            apellido:           res.apellido ?? '',
            documento:          res.documento ?? doc,
            telefono:           res.telefono ?? '',
            email:              res.emailFicticio ? '' : (res.email ?? ''),
            tipoIdentificacion: res.tipoIdentificacion ?? 'C.C.',
            segundoNombre:      res.segundoNombre ?? '',
            segundoApellido:    res.segundoApellido ?? '',
            genero:             res.genero ?? '',
            fechaNacimiento:    res.fechaNacimiento
              ? new Date(res.fechaNacimiento).toISOString().split('T')[0]
              : '',
            direccion:          res.direccion ?? '',
            barrio:             res.barrio ?? '',
            departamento:       res.departamento ?? '',
            municipio:          res.municipio ?? '',
            departamentoNacimiento: res.departamentoNacimiento ?? '',
            municipioNacimiento:    res.municipioNacimiento ?? '',
            pais:               res.pais ?? 'Colombia',
            paisNacimiento:     res.paisNacimiento ?? 'Colombia',
            zonaResidencia:     res.zonaResidencia ?? '',
            enfoquePoblacional: res.enfoquePoblacional ?? '',
            tieneDiscapacidad:  res.tieneDiscapacidad ?? false,
            tipoDiscapacidad:   res.tipoDiscapacidad ?? '',
            estrato:            res.estrato ?? '',
            eps:                res.eps ?? '',
            acudienteNombre:    res.perfil?.acudiente_nombre ?? '',
            acudienteTelefono:  res.perfil?.acudiente_telefono ?? '',
            acudienteParentesco: res.perfil?.acudiente_parentesco ?? '',
            role:               res.roles ?? ['estudiante'],
          });

          if (res.departamento) {
            const depRes = this.ubicacion.departamentos()
              .find(d => d.name.toLowerCase().trim() === res.departamento?.toLowerCase().trim());
            if (depRes) {
              this.form.patchValue({ departamentoId: depRes.id });
              this.ubicacion.getMunicipios(depRes.id).subscribe(municipios => {
                const munRes = municipios.find(
                  m => m.name.toLowerCase().trim() === res.municipio?.toLowerCase().trim()
                );
                if (munRes) this.form.patchValue({ municipioId: munRes.id });
              });
            }
          }

          if (res.departamentoNacimiento) {
            const depNac = this.ubicacion.departamentos()
              .find(d => d.name.toLowerCase().trim() === res.departamentoNacimiento?.toLowerCase().trim());
            if (depNac) {
              this.form.patchValue({ departamentoNacId: depNac.id });
              this.ubicacion.getMunicipios(depNac.id).subscribe(municipios => {
                const munNac = municipios.find(
                  m => m.name.toLowerCase().trim() === res.municipioNacimiento?.toLowerCase().trim()
                );
                if (munNac) this.form.patchValue({ municipioNacId: munNac.id });
              });
            }
          }

          // ── Si ya está completo y ya es estudiante: saltar directo a inscripción ──
          const yaEsEstudiante = (res.roles ?? []).includes('estudiante');
          if (res.perfilCompleto && yaEsEstudiante) {
            this.completarFlujoDirecto(res.id!, res.documento ?? doc);
            return;
          }

        } else {
          this.esNuevo.set(true);
          this.rolesExistentes.set([]);
          this.form.patchValue({
            documento: doc,
            password:  doc,
            role:      ['estudiante'],
          });
        }
        this.paso.set('datos');
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message ?? 'Error al verificar el documento');
      }
    });
  }

  // Perfil ya completo y ya es estudiante -> sin pasar por el formulario ni por "listo"
  private completarFlujoDirecto(usuarioId: string, documento: string) {
    this.usuarioId.set(usuarioId);
    this.paso.set('listo');
    this.registrado.emit({ usuarioId, documento });
    if (!this.esModal) {
      this.irACursos(); // navega directo a cursos-disponibles, sin pantalla intermedia
    }
  }

  // ----------------------------------------------------------------
  // PASO 2: Guardar o Actualizar Perfil
  // ----------------------------------------------------------------
  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.errorMsg.set(null);
    const val = this.form.getRawValue();

    // Unión sin duplicados: lo que ya tenía + lo marcado en el form + 'estudiante' forzado
    const rolesFinal = Array.from(new Set([
      ...(this.rolesExistentes() ?? []),
      ...((val.role ?? []) as string[]),
      'estudiante',
    ]));

    if (this.esNuevo()) {
      const payloadRegistro: any = {
        nombre:             val.nombre.trim(),
        apellido:           val.apellido.trim(),
        documento:          val.documento.trim(),
        tipoIdentificacion: String(val.tipoIdentificacion || 'C.C.').trim(),
        password:           val.password || val.documento,
        segundoNombre:      val.segundoNombre?.trim() || undefined,
        segundoApellido:    val.segundoApellido?.trim() || undefined,
        genero:             val.genero || undefined,
        fechaNacimiento:    val.fechaNacimiento || undefined,
        telefono:           val.telefono?.trim() || undefined,
        email:              val.email?.trim() ? val.email.trim() : undefined,
        direccion:          val.direccion?.trim() || undefined,
        barrio:             val.barrio?.trim() || undefined,
        municipio:          val.municipio || undefined,
        departamento:       val.departamento || undefined,
        pais:               val.pais || 'Colombia',
        municipioNacimiento:    val.municipioNacimiento || undefined,
        departamentoNacimiento: val.departamentoNacimiento || undefined,
        paisNacimiento:     val.paisNacimiento || 'Colombia',
        zonaResidencia:     val.zonaResidencia || undefined,
        enfoquePoblacional: val.enfoquePoblacional || undefined,
        tieneDiscapacidad:  Boolean(val.tieneDiscapacidad),
        tipoDiscapacidad:   val.tipoDiscapacidad || undefined,
        estrato:            val.estrato ? Number(val.estrato) : undefined,
        eps:                val.eps?.trim() || undefined,
        acudienteNombre:    val.acudienteNombre?.trim() || undefined,
        acudienteTelefono:  val.acudienteTelefono?.trim() || undefined,
        acudienteParentesco: val.acudienteParentesco?.trim() || undefined,
        roles:              rolesFinal, // ← antes: "role" (singular) — el backend leía "roles" y nunca lo recibía
      };

      this.usuariosAdmin.registrarEstudianteCompleto(payloadRegistro)
        .pipe(finalize(() => this.guardando.set(false)))
        .subscribe({
          next: (res: any) => {
            const idGenerado = res.usuario?.id ?? res.user?.id ?? res.id;
            this.usuarioId.set(idGenerado);
            this.paso.set('listo');
            this.registrado.emit({ usuarioId: idGenerado, documento: val.documento });
          },
          error: (err) => {
            const msg = Array.isArray(err.error?.message)
              ? err.error.message.join(' | ')
              : (err.error?.message ?? 'Error al registrar el estudiante.');
            this.errorMsg.set(msg);
          }
        });

    } else {
      const payloadPerfil: any = {
        nombre:             val.nombre.trim(),
        segundoNombre:      val.segundoNombre.trim(),
        apellido:           val.apellido.trim(),
        segundoApellido:    val.segundoApellido.trim(),
        genero:             val.genero || undefined,
        telefono:           val.telefono?.trim() || undefined,
        fechaNacimiento:    val.fechaNacimiento || undefined,
        tipoIdentificacion: String(val.tipoIdentificacion || 'C.C.').trim(),
        direccion:          val.direccion?.trim() || undefined,
        barrio:             val.barrio?.trim() || undefined,
        municipio:          val.municipio || undefined,
        departamento:       val.departamento || undefined,
        departamentoNacimiento: val.departamentoNacimiento || undefined,
        municipioNacimiento:    val.municipioNacimiento || undefined,
        paisNacimiento:     val.paisNacimiento || 'Colombia',
        pais:               val.pais || 'Colombia',
        zonaResidencia:     val.zonaResidencia || undefined,
        enfoquePoblacional: val.enfoquePoblacional || undefined,
        tieneDiscapacidad:  Boolean(val.tieneDiscapacidad),
        tipoDiscapacidad:   val.tipoDiscapacidad || undefined,
        estrato:            val.estrato ? Number(val.estrato) : undefined,
        eps:                val.eps?.trim() || undefined,
        acudienteNombre:    val.acudienteNombre?.trim() || undefined,
        acudienteTelefono:  val.acudienteTelefono?.trim() || undefined,
        acudienteParentesco: val.acudienteParentesco?.trim() || undefined,
        roles:              rolesFinal, // ← antes: no se enviaba nada, por eso nunca se agregaba 'estudiante'
      };

      this.usuariosAdmin.completarPerfil(this.usuarioId()!, payloadPerfil)
        .pipe(finalize(() => this.guardando.set(false)))
        .subscribe({
          next: () => {
            this.paso.set('listo');
            this.registrado.emit({ usuarioId: this.usuarioId()!, documento: val.documento });
          },
          error: (err) => {
            const msg = Array.isArray(err.error?.message)
              ? err.error.message.join(' | ')
              : (err.error?.message ?? 'Error al actualizar el perfil');
            this.errorMsg.set(msg);
          }
        });
    }
  }

  onDepartamentoChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const dep = this.ubicacion.departamentos().find(d => d.id === +select.value);
    if (!dep) return;
    this.form.patchValue({ departamento: dep.name, municipio: '', municipioId: '' });
    this.ubicacion.getMunicipios(dep.id).subscribe();
  }

  onMunicipioChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const mun = this.ubicacion.municipios().find(m => m.id === +select.value);
    if (mun) this.form.patchValue({ municipio: mun.name });
  }

  onDepNacimientoChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const dep = this.ubicacion.departamentos().find(d => d.id === +select.value);
    if (!dep) return;
    this.form.patchValue({ departamentoNacimiento: dep.name, municipioNacimiento: '' });
    this.ubicacion.getMunicipios(dep.id).subscribe();
  }

  onMunNacimientoChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const mun = this.ubicacion.municipios().find(m => m.id === +select.value);
    if (mun) this.form.patchValue({ municipioNacimiento: mun.name });
  }

  toggleRol(rol: string) {
    const roles: string[] = this.form.get('role')!.value ?? [];
    const idx = roles.indexOf(rol);
    idx === -1 ? roles.push(rol) : roles.splice(idx, 1);
    this.form.patchValue({ role: [...roles] });
  }

  tieneRol(rol: string): boolean {
    return (this.form.get('role')!.value ?? []).includes(rol);
  }

  irACursos() {
    if (this.esModal) {
      this.cancelado.emit();
    } else {
      this.router.navigate(['admin/academico/cursos-disponibles'], {
        queryParams: { usuarioId: this.usuarioId() }
      });
    }
  }

  cerrarModal() {
    this.cancelado.emit();
  }

  volver() {
    this.resetearFormulario();
    this.paso.set('documento');
  }

  private calcularEdad(fecha: Date): number {
    const hoy  = new Date();
    let edad   = hoy.getFullYear() - fecha.getFullYear();
    const mes  = hoy.getMonth() - fecha.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) edad--;
    return edad;
  }

  campo(name: string): AbstractControl {
    return this.form.get(name)!;
  }

  invalido(name: string): boolean {
    const c = this.campo(name);
    return c.invalid && (c.dirty || c.touched);
  }
}