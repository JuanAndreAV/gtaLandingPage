import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Contact } from '../models/contact';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  http = inject(HttpClient);
  url: string = "assets/data/contact.json";

  getContact(): Observable<Contact>{
    return this.http.get<Contact>(this.url)
  }
}
