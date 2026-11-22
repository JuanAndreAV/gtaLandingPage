import { Component, computed, inject, signal } from '@angular/core';
import { NewsService } from '../../services/news.service';
import { EventsService } from '../../services/events.service';
import { Event } from '../../models/event';
import { News } from '../../models/news';
import { NewsCardComponent } from '../../shared/components/news-card/news-card.component';
import { EventItemComponent } from '../../shared/components/event-item/event-item.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [NewsCardComponent, EventItemComponent, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  standalone: true
})
export class HomeComponent {
  newsService = inject(NewsService);
  eventsService = inject(EventsService);

  news = signal<News[]>([]);
  events = signal<Event[]>([]);
  loadingNews = signal(true);
  loadingEvents = signal(true);
  errorNews = signal('');
  errorEvents = signal('');

  readonly anioActual = new Date().getFullYear();

  statistics = [
    { value: '262', label: 'Cursos ofertados en 2026' },
    { value: '1500+', label: 'Estudiantes activos' },
    { value: '30', label: 'Docentes de áreas artísticas' },
    { value: '1800+', label: 'Personas inscritas en nuestros cursos' }
  ];

  areas = [
    { nombre: 'Música', descripcion: 'Instrumentos, canto, bandas y agrupaciones musicales.', icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3' },
    { nombre: 'Danza', descripcion: 'Danza folclórica, urbana y contemporánea.', icon: 'M13 5a2 2 0 11-4 0 2 2 0 014 0zM7 21l3-7 2 2v5m-2-7l1.5-4.5L15 11l3 1M8.5 9.5L6 12' },
    { nombre: 'Artes plásticas', descripcion: 'Dibujo, pintura, escultura y técnicas mixtas.', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
    { nombre: 'Teatro', descripcion: 'Expresión corporal, actuación y montaje escénico.', icon: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { nombre: 'Literatura', descripcion: 'Lectura, escritura creativa y oralidad.', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { nombre: 'Patrimonio', descripcion: 'Memoria, tradiciones e identidad de Girardota.', icon: 'M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6' }
  ];

  pasos = [
    { titulo: 'Explora la oferta', descripcion: 'Consulta en línea los cursos disponibles, horarios, sedes y requisitos de cada taller.' },
    { titulo: 'Acude presencialmente', descripcion: 'Dirígete a la Casa de la Cultura Pedrito Ruíz con tu documento de identidad para realizar la matrícula.' },
    { titulo: 'Inicia tu proceso', descripcion: 'Una vez matriculado, comienza tu formación con nuestros docentes.' }
  ];

  /** Eventos con fecha de hoy en adelante, ordenados del más cercano al más lejano */
  proximosEventos = computed(() => {
    const d = new Date();
    const hoy = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return this.events()
      .filter(e => (e.date ?? '') >= hoy)
      .sort((a, b) => a.date.localeCompare(b.date));
  });

  /** Si no hay próximos, se muestran los 3 más recientes como referencia */
  eventosRecientes = computed(() =>
    this.events()
      .filter(e => !this.proximosEventos().includes(e))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 3)
  );

  ngOnInit(): void {
    this.loadNews();
    this.loadEvents();
  }

  private loadNews(): void {
    this.newsService.getNews().subscribe({
      next: (data) => {
        console.log('📰 News loaded:', data);
        this.news.set(data);
        this.loadingNews.set(false);
      },
      error: (err) => {
        console.error('❌ Error loading news:', err);
        this.errorNews.set('Error al cargar noticias');
        this.loadingNews.set(false);
      }
    });
  }
  private loadEvents(): void {
    this.eventsService.getEvents().subscribe({
      next: (data) => {
        console.log('📅 Events loaded:', data);
        this.events.set(data);
        this.loadingEvents.set(false);
      },
      error: (err) => {
        console.error('❌ Error loading events:', err);
        this.errorEvents.set('Error al cargar eventos');
        this.loadingEvents.set(false);
      }
    });
  }


}
