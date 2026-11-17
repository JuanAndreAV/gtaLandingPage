import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'; // ajusta la ruta

@Injectable({ providedIn: 'root' })
export class CursosDocenteService {
  private http = inject(HttpClient);
  private base = `${environment.baseUrl}/cursos`;

  misCursos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/mis-cursos`);
  }

  curso(id: string): Observable<any> {
    return this.http.get<any>(`${this.base}/${id}`);
  }
}