import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';


export const routes: Routes = [
   {
    path: "auth",
    loadChildren: () => import('./auth/auth.routes'),
    //Guards TODO
   },
   {
    path: "",
    component: HomeComponent
   }
];
