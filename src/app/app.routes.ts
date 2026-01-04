import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { DashboardComponent } from './features/admin/dashboard/dashboard.component';
import { DashboardReportsComponent } from './features/admin/dashboard-reports/dashboard-reports.component';
import { CourseManagementComponent } from './features/admin/course-management/course-management.component';
import { UserManagementComponent } from './features/admin/user-management/user-management.component';
import { RegistrationComponent } from './features/admin/registration/registration.component';


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
      component: DashboardComponent,
      children: [
         {
              path: '',
              redirectTo: 'reports',
              pathMatch: 'full'
         },
         {
              path: 'reports' ,
              component: DashboardReportsComponent
         },
         {
            path: 'cursos',
            component: CourseManagementComponent
         },
         {
            path: 'usuarios',
            component: UserManagementComponent
         },
         {
            path: 'inscripciones',
            component: RegistrationComponent
         }

      ]
   }
];
