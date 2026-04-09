import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Novedad , respuestaNovedad} from '../models/novedad';
import { catchError, finalize, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NovedadService {

  private http = inject(HttpClient);
  private apiUrl = environment.culturaEventosApi;
  public isLoading = signal<boolean>(false);
  public error = signal<string | null>(null);
  public updates = signal<respuestaNovedad[]>([]);
  public mensaje = signal<string>('');

  public reporteNovedad(novedad: Novedad){
    return this.http.post(`${this.apiUrl}/cambio-horario`, novedad);
  } 

  public getAllUpdates(): Observable<respuestaNovedad[]> {
    this.isLoading.set(true);
    this.error.set(null);
    this.mensaje.set('');
    this.updates.set([]);
    return this.http.get<respuestaNovedad[]>(`${this.apiUrl}/cambio-horario`).pipe(
      tap( data =>  {
        this.updates.set(data);
        this.isLoading.set(false);
      }),
      catchError( err=>{
        this.error.set(err.message ?? 'Error al cargar las novedades.');
        this.isLoading.set(false);
        return [];  
      }),
      finalize(() => this.isLoading.set(false))

    );
  }

  public getUpdatesByEstado(estado: string): Observable<respuestaNovedad[]> {
    this.isLoading.set(true);
    this.error.set(null);
    this.updates.set([]);
    this.mensaje.set('');
  return this.http.get<respuestaNovedad[]>(`${this.apiUrl}/cambio-horario/estado/${estado}`).pipe(
    tap( data =>  {
      this.updates.set(data);
      this.isLoading.set(false);
    }),
    catchError( err=>{
      this.error.set(err.message ?? 'Error al cargar las novedades por estado.');
      this.isLoading.set(false);
      return [];  
    }),
    finalize(() => this.isLoading.set(false))
  );  }

  public updateNovedad(id: string, novedad: Partial<Novedad & { estado: string }>): Observable<respuestaNovedad> {
  this.isLoading.set(true);
  this.error.set(null);
  this.mensaje.set('');
  return this.http.patch<respuestaNovedad>(`${this.apiUrl}/cambio-horario/${id}`, novedad).pipe(
    tap(() => {
      this.mensaje.set('Novedad actualizada exitosamente.');
      this.isLoading.set(false);
    }),
    catchError(err => {
      this.error.set(err.message ?? 'Error al actualizar la novedad.');
      this.isLoading.set(false);
      throw err;   // ← re-lanza para que el componente lo capture en el error callback
    }),
    finalize(() => this.isLoading.set(false))
  );
}
 
}
