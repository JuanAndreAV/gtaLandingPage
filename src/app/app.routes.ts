import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { DashboardComponent } from './features/admin/dashboard/dashboard.component';


export const routes: Routes = [
   {
    path: "auth",
    loadChildren: () => import('./auth/auth.routes'),
    //Guards TODO
   },
   {
    path: "",
    component: HomeComponent
   },
   {
      path: "admin",
      component: DashboardComponent
   }
];
