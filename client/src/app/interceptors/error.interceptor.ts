import { HttpInterceptorFn } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { EMPTY, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError(err => {
      // 404 — route not found
      if (err.status === 404) {
        console.warn(`404: ${req.url} — skipping`);
        // Return empty instead of crashing
        return EMPTY;
      }
      
      // 403 — forbidden
      if (err.status === 403) {
        console.warn(`403: ${req.url} — skipping`);
        return EMPTY;
      }
      
      // Network error
      if (err.status === 0) {
        console.warn('Network error — offline?');
        return EMPTY;
      }
      
      // All other errors
      return throwError(() => err);
    })
  );
};
