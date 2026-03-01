import { Component, inject, NgModule, OnInit, signal } from '@angular/core';
import { Q10PoblacionService } from '../../services/academico/q10-poblacion.service';
import { FormsModule, NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-q10-poblacion',
  imports: [CommonModule, FormsModule],
  templateUrl: './q10-poblacion.component.html',
  styleUrl: './q10-poblacion.component.css',
})
export class Q10PoblacionComponent implements OnInit {
  public poblacionQ10 = inject(Q10PoblacionService);

  ngOnInit() {
    this.poblacionQ10.obtenerPoblacionQ10(0).subscribe();
    
  }


}
