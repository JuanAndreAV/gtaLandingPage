import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface Encuesta {
  encuestaId: string;
  usuario: string;
  documento: string;
  campoPersonalizado: string;
  respuestas: any[];
}
@Injectable({
  providedIn: 'root',
})
export class EncuestaService {
  private apiUrl = `${environment.culturaEventosApi}/encuestas`;
  http = inject(HttpClient);

  public createEncuesta(encuesta: Encuesta): Observable<Encuesta> {
    return this.http.post<Encuesta>(this.apiUrl, encuesta);
  };


  
}
