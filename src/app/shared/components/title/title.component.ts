import { Component, input } from '@angular/core';
import { NgClass } from "../../../../../node_modules/@angular/common/types/_common_module-chunk";

@Component({
  selector: 'app-title',
  imports: [],
  templateUrl: './title.component.html',
  
})
export class TitleComponent {
 title = input.required<string>();
 subtitle = input<string>();
 titleClass = input<string>();
 span = input<string>();
}
