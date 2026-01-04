import { Component, inject, OnInit, signal } from '@angular/core';
import { NavigateOptionsComponent } from '../navigate-options/navigate-options.component';
import { RouterModule } from '@angular/router';



@Component({
  selector: 'app-dashboard',
  imports: [NavigateOptionsComponent, RouterModule], 
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  standalone: true
})
export class DashboardComponent   {
 


}
