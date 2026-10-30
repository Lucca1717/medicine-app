import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular';
import { httpErrorInterceptor } from './core/interceptors/error.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideIonicAngular({ mode: 'md' }),
    provideHttpClient(withInterceptors([httpErrorInterceptor])),
    provideRouter(routes),
  ],
};
