import { Component, input } from '@angular/core';

interface AnalisisPrograma {
  codigo: string;
  nombre: string;
  cursos: number;
  inscritos: number;
  matriculados?: number;
  cupoTotal: number;
  ocupacion: number;
  docentes: Set<string>;
}
@Component({
  selector: 'app-table',
  imports: [],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
})
export class TableComponent {
  public theadItems = input<any[]>();
  public tbodyItems = input<AnalisisPrograma[]>();

}
