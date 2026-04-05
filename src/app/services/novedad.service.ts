import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Novedad } from '../models/novedad';

@Injectable({
  providedIn: 'root',
})
export class NovedadService {

  private http = inject(HttpClient);
  private apiUrl = environment.culturaEventosApi;

  public reporteNovedad(novedad: Novedad){
    return this.http.post(`${this.apiUrl}/cambio-horario`, novedad);
  } 
  
}
