import { ApplicationConfig, importProvidersFrom, ErrorHandler } from '@angular/core';
import { GlobalErrorHandler } from './services/error-handler.service';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { LucideAngularModule } from 'lucide-angular';
import { appIcons } from './app-icons';
import { CDK_DRAG_CONFIG } from '@angular/cdk/drag-drop';

const dragConfig = {
  dragStartThreshold: 0,
  pointerDirectionChangeThreshold: 5,
  zoomLevel: 1,
  zIndex: 10000
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes,
      withComponentInputBinding(),
      withViewTransitions()
    ),
    provideHttpClient(withFetch()),
    provideClientHydration(),
    importProvidersFrom(LucideAngularModule.pick(appIcons)),
    provideAnimations(),
    {
      provide: CDK_DRAG_CONFIG,
      useValue: dragConfig
    },
    { provide: ErrorHandler, useClass: GlobalErrorHandler }
  ]
};
