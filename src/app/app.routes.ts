import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { DashboardComponent } from './features/admin/dashboard/dashboard.component';
import { DashboardReportsComponent } from './features/admin/dashboard-reports/dashboard-reports.component';
import { CourseManagementComponent } from './features/admin/course-management/course-management.component';
import { UserManagementComponent } from './features/admin/user-management/user-management.component';
import { RegistrationComponent } from './features/admin/registration/registration.component';
import { notAuthenticatedGuard } from './auth/guards/not-authenticated.guard';
import { isAdminGuard } from './auth/guards/is-admin.guard';
import { isAuthenticatedGuard } from './auth/guards/is-authenticated.guard';
import { AreaprofesorComponent } from './features/profesor/areaprofesor/areaprofesor.component';
import { Q10ConsultaDocenteComponent } from './pages/q10-consulta-docente/q10-consulta-docente.component';


export const routes: Routes = [
    {
      path: "estudiantes",
      component: Q10ConsultaDocenteComponent

   },
   {
    path: "",
    component: HomeComponent,
    
   },
   
   {
    path: "auth",
    loadChildren: () => import('./auth/auth.routes'),
    //Guards TODO
    canMatch: [
      notAuthenticatedGuard,
      ()=> { console.log('Guard para rutas de auth'); return true; }
    ]
   },
   
   {
      path: "admin",
      component: DashboardComponent,  
     canMatch: [
            isAdminGuard, isAuthenticatedGuard
        ], 
      
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
   },
   {
      path: "profesor",
      canActivate: [isAuthenticatedGuard, ],
      component: AreaprofesorComponent,
   }
];
