import { ApplicationConfig, importProvidersFrom, ErrorHandler } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { LucideAngularModule } from 'lucide-angular';
import { appIcons } from './app-icons';
import { CDK_DRAG_CONFIG } from '@angular/cdk/drag-drop';
import { GlobalErrorHandler } from './services/error-handler.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes,
      withComponentInputBinding(),
      withViewTransitions()
    ),
    provideHttpClient(withFetch()),
    importProvidersFrom(LucideAngularModule.pick(appIcons)),
    provideAnimations(),
    {
      provide: CDK_DRAG_CONFIG,
      useValue: {
        dragStartThreshold: 0,
        pointerDirectionChangeThreshold: 5
      }
    },
    { provide: ErrorHandler, useClass: GlobalErrorHandler }
  ]
};
