// src/app/services/gestion-academica/docentes.service.ts
import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { tap, catchError, of, finalize, Observable } from 'rxjs';
import { PerfilDocente } from '../../models/gestion-academica/docentes';



@Injectable({ providedIn: 'root' })
export class DocentesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.baseUrl}/usuarios/docentes`;

  public docentes = signal<PerfilDocente[]>([]);
  public isLoading = signal(false);

  public docentesConNombreCompleto = computed(() =>
    this.docentes().map(docente => ({
      ...docente,
      nombreCompleto: [
        docente.nombre,
        docente.segundoNombre,
        docente.apellido,
        docente.segundoApellido
      ]
        .filter(Boolean)
        .join(' ')
    }))
  );

  listar(): Observable<PerfilDocente[]> {
    this.isLoading.set(true);
   
    return this.http.get<PerfilDocente[]>(this.apiUrl).pipe(
      tap(res => this.docentes.set(res ?? [])),
      catchError((e) => { 
        console.error(e)
        this.docentes.set([]); return of([]); }),
      finalize(() => this.isLoading.set(false)),
    );
  }
}