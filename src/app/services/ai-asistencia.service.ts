import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AiAsistenciaService {
private http = inject(HttpClient);
private apiUrl = environment.culturaEventosApi;

public isError = signal<string | null>('');
public isLoading = signal<boolean>(false);
public respuestaAI = signal<string>('');

public analizarAsistencia(datos: any) {
  this.isLoading.set(true);
  this.isError.set(null);
  this.respuestaAI.set('');

  this.http.post(
    `${this.apiUrl}/ai/prompts`,
    { prompt: JSON.stringify(datos) },
    { responseType: 'text' }   
  ).subscribe({
    next: (response) => {
      this.respuestaAI.set(response);
      this.isLoading.set(false);
    },
    error: (err) => {
      this.isError.set(err.message ?? 'Error al generar el análisis.');
      this.isLoading.set(false);
    }
  });
}
}
