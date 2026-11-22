import { Component, computed, input } from '@angular/core';
import { Event } from '../../../models/event';

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

const ACCENT: Record<Event['borderColor'], string> = {
  teal: 'bg-inst-600',
  yellow: 'bg-inst-gold',
  orange: 'bg-[#b5652a]'
};

@Component({
  selector: 'app-event-item',
  imports: [],
  standalone: true,
  templateUrl: './event-item.component.html',
  styleUrl: './event-item.component.css'
})
export class EventItemComponent {
  event = input.required<Event>();

  accentClass = computed(() => ACCENT[this.event().borderColor] ?? 'bg-gray-400');

  /** Parsea "YYYY-MM-DD" sin zona horaria para evitar corrimientos de día */
  fecha = computed(() => {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(this.event().date ?? '');
    if (!m) return null;
    const d = new Date(+m[1], +m[2] - 1, +m[3]);
    if (isNaN(d.getTime())) return null;
    return { dia: d.getDate(), mes: MESES[d.getMonth()], semana: DIAS[d.getDay()] };
  });
}
