import { Component, input } from '@angular/core';
import { News } from '../../../models/news';


@Component({
  selector: 'app-news-card',
  imports: [],
  templateUrl: './news-card.component.html',
  styleUrl: './news-card.component.css',
  standalone: true
})
export class NewsCardComponent {
 news = input.required<News>();

 getBadgeColorClass(): string {
    const colorMap: Record<string, string> = {
      'yellow': 'bg-girardota-yellow text-girardota-teal-dark',
      'orange': 'bg-girardota-orange text-white',
      'blue': 'bg-girardota-blue text-girardota-teal-dark',
      'teal': 'bg-girardota-teal text-white'
    };
    return colorMap[this.news().badgeColor] || 'bg-gray-500 text-white';
  }

  getIconGradientClass(): string {
    return `bg-gradient-to-br ${this.news().iconGradient}`;
  }

  getIconPath(): string {
    const icons: Record<string, string> = {
      'music': 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3',
      'palette': 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
      'theater': 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      'dance': 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      'book': 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
    };
    return icons[this.news().icon] || icons['book'];
  }
}
