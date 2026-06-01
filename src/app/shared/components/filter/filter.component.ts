import { Component, input, output } from '@angular/core';
interface FilterItem {
  val: string;
  label: string;
}
@Component({
  selector: 'app-filter',
  imports: [],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.css',
})
export class FilterComponent {
  items = input<FilterItem[]>([]);
  activeClass = input<string>("");
  selected = output<FilterItem>();


}
  