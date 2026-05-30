import { ErrorHandler, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    if (!environment.production) {
      console.error('Global error:', error);
    }
    // In production: could send to error tracking service like Sentry
  }
}
// catchError

