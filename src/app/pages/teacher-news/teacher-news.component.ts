import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { NovedadService } from '../../services/novedad.service';
import { DatePipe } from '@angular/common';
import { respuestaNovedad } from '../../models/novedad';
import { NovedadesComponent } from '../../features/admin/novedades/novedades.component';

type Filtro = 'todos' | 'pendiente' | 'aprobado' | 'rechazado';

@Component({
  selector: 'app-teacher-news',
  imports: [ NovedadesComponent],
  templateUrl: './teacher-news.component.html',
  styleUrl: './teacher-news.component.css',
})
export class TeacherNewsComponent  {
title = signal<string>("Novedades de profesores");
subtitle = signal<string>("Consulta el estado de tus reportes y novedades");
readonly  isAdmin = signal<boolean>(false);
  

}
