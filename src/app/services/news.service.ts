import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { News } from '../models/news';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
private readonly http = inject(HttpClient);
private readonly url: string = "assets/data/news.json";

getNews(): Observable<News[]>{
  return this.http.get<{news : News[]}>(this.url).pipe
  (map(res => res.news.filter(item => item.active)));
}
getNewsById(id: string): Observable<News | undefined>{
  return this.getNews().pipe(map(news => news.find(item => item.id === id)));
}


 
}
