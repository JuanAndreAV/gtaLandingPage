import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';



import { routes } from './app.routes';
import { provideHttpClient, withJsonpSupport, withInterceptors} from '@angular/common/http';
import { logginInterceptor } from './shared/interceptors/loggin.interceptor';
import { authInterceptor } from './auth/interceptor/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideHttpClient(withJsonpSupport(),
  withInterceptors([logginInterceptor, authInterceptor])
  ),
  provideCharts(withDefaultRegisterables())
  ]
};
