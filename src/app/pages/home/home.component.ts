import { Component, inject, signal } from '@angular/core';
import { NewsService } from '../../services/news.service';
import { EventsService } from '../../services/events.service';
import { Event } from '../../models/event';
import { News } from '../../models/news';
import { NewsCardComponent } from '../../shared/components/news-card/news-card.component';
import { EventItemComponent } from '../../shared/components/event-item/event-item.component';

@Component({
  selector: 'app-home',
  imports: [NewsCardComponent, EventItemComponent],
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

  statistics = [
    { value: '262', label: 'Cursos ofertados en 2026' },
    { value: '1500+', label: 'Estudiantes activos' },
    { value: '30', label: 'Docentes de áreas artísticas' },
    { value: '1800+', label: 'Personas inscritas en nuestros cursos' }
  ];

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
