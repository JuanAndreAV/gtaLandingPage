import { Component, input } from '@angular/core';
import { Event } from '../../../models/event';


@Component({
  selector: 'app-event-item',
  imports: [],
  standalone: true,
  templateUrl: './event-item.component.html',
  styleUrl: './event-item.component.css'
})
export class EventItemComponent {
event = input.required<Event>()

getBorderColorClass(): string {
    const colorMap: Record<string, string> = {
      'teal': 'border-girardota-teal',
      'yellow': 'border-girardota-yellow',
      'orange': 'border-girardota-orange'
    };
    return colorMap[this.event().borderColor] || 'border-gray-500';
  }
getBackgroundGradientClass(): string {
    return `bg-gradient-to-r ${this.event().bgGradient}`;
  }

  getDateColorClass(): string {
    const colorMap: Record<string, string> = {
      'teal': 'text-girardota-teal',
      'yellow': 'text-girardota-yellow',
      'orange': 'text-girardota-orange'
    };
    return colorMap[this.event().borderColor] || 'text-gray-900';
  }

}
