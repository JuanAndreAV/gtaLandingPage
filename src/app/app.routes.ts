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
import { ReportesComponent } from './pages/reportes/reportes.component';
import { Q10PoblacionComponent } from './pages/q10-poblacion/q10-poblacion.component';
import { Q10AsistenciaComponent } from './pages/q10-asistencia/q10-asistencia.component';
import { InasistenciaQ10Component } from './shared/components/inasistencia-q10/inasistencia-q10.component';
import { AnalisisAiComponent } from './features/admin/analisis-ai/analisis-ai.component';
import { ReporteNovedadesComponent } from './features/profesor/reporte-novedades/reporte-novedades.component';
import { NovedadesComponent } from './features/admin/novedades/novedades.component';


export const routes: Routes = [
   {
      path: "novedades-profesor",
      component: ReporteNovedadesComponent
   },
   {
      path: "novedades",
      component: NovedadesComponent
   },
  
   {
      path: "inasistencia",
      component: InasistenciaQ10Component
   },
    {
      path: "estudiantes",
      component: Q10ConsultaDocenteComponent

   },
   {
      path: "reportes",
      component: ReportesComponent
   },
   {
      path: "poblacion",
      component: Q10PoblacionComponent
   },
   {
      path: "asistencia",
      component: Q10AsistenciaComponent,

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
         },{
            path: 'analisis-ai',
            component: AnalisisAiComponent

         }

      ] 
   },
   {
      path: "profesor",
       component: AreaprofesorComponent,
      canActivate: [isAuthenticatedGuard],
      children: [
          {path: 'reporte-novedades',
         component: ReporteNovedadesComponent},
      ]

   }
];
