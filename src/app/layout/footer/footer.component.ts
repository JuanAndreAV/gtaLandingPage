import { Component, inject, OnInit, signal } from '@angular/core';
import { ContactService } from '../../services/contact.service';
import { Contact } from '../../models/contact';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit {
currentYear = signal(new Date().getFullYear())
contactService = inject(ContactService);
  contact = signal<Contact | null>(null);
  loading = signal(true);
  error = signal<string>('');

//contact: string[] = []
ngOnInit(): void {
    this.getContactInfo()
}
getContactInfo() {
    this.contactService.getContact().subscribe({
      next: (data) => { 
        
        
        this.contact.set(data);
        this.loading.set(false);
      },
      error: (err) => { 
        console.error('❌ Error loading contact:', err);
        this.error.set('Failed to load contact information');
        this.loading.set(false);
      }
    });
  }
}
