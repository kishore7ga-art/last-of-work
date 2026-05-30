import {
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http'
import { catchError, EMPTY } from 'rxjs'

export const errorInterceptor:
  HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      console.warn(
        `[${err.status}] ${req.url}`)
      if ([0, 403, 404].includes(err.status)) {
        return EMPTY
      }
      throw err
    })
  )
}
