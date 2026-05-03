import { Component, signal } from '@angular/core';
import { TitleComponent } from '../../shared/components/title/title.component';

@Component({
  selector: 'app-observatorio',
  imports: [TitleComponent],
  templateUrl: './observatorio.component.html',
  styleUrl: './observatorio.component.css',
})
export class ObservatorioComponent {
  url = signal<string>("https://juanandreav.github.io/observatorio-cutural/");

}
