import { Injectable, inject, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, Observable, tap, of } from 'rxjs';
export interface Encuesta {
  encuestaId: string;
  usuario: string;
  documento: string;
  fechaEnvio?: string;
  campoPersonalizado: string;
  respuestas: any[];
}
@Injectable({
  providedIn: 'root',
})
export class EncuestaService {
  private apiUrl = `${environment.culturaEventosApi}/encuestas`;
  public todasLasEncuestas = signal<Encuesta[]>([]);
  public errorMessage = signal("");
  public isLoading = signal(false)
  http = inject(HttpClient);

  public createEncuesta(encuesta: Encuesta): Observable<Encuesta> {
    return this.http.post<Encuesta>(this.apiUrl, encuesta);
  };

  public verEncuestas(): Observable<Encuesta[]>{
    this.isLoading.set(true);
    return this.http.get<Encuesta[]>(this.apiUrl).pipe(
      tap(response=>  {this.todasLasEncuestas.set(response), console.log(Response)}),
      catchError(err=>{
        const {message } = err.error;
        this.errorMessage.set(message);
        this.todasLasEncuestas.set([])
        return of ([])
      }),
      finalize(()=>{this.isLoading.set(false)})
    );
  };
   public verEncuestaByDocument(document: string):Observable<Encuesta[]>{
      this.isLoading.set(true)
      return this.http.get<Encuesta[]>(`${this.apiUrl}/${document}`).pipe(
        tap(response => this.todasLasEncuestas.set(response)),
        catchError(err=>{
          const { message } = err.console.error;
          this.errorMessage.set(message);
          this.todasLasEncuestas.set([]);
          return of ([])
        }),
        finalize(()=> {this.isLoading.set(false)})
      )
    };

    actualizarEstado(id: string, estado: boolean):Observable<Encuesta>{
      return this.http.patch<Encuesta>(`${this.apiUrl}/${id}/estado`, {estado});
    }


  
}
