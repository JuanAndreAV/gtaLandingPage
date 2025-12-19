import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Event } from '../models/event';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
private readonly http = inject(HttpClient);
private readonly url: string = "assets/data/events.json";
  
getEvents(): Observable<Event[]> {
    return this.http.get<{ events: Event[] }>(this.url).pipe(
      map(response => response.events.filter(item => item.active))
    );
  }
  getEventById(id: string): Observable<Event | undefined> {
    return this.getEvents().pipe(
      map(events => events.find(event => event.id === id))
    )
  }
}
