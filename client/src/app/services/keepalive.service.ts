import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class KeepAliveService {
  private http = inject(HttpClient);
  private interval: any = null;

  start(): void {
    // Ping backend every 14 minutes
    // Render free tier sleeps after 15 mins
    this.interval = setInterval(() => {
      this.http.get(
        `${environment.apiUrl}/health`,
        { headers: {
          'X-Keepalive': 'true'
        }}
      ).pipe(
        catchError(() => of(null))
      ).subscribe();
    }, 14 * 60 * 1000); // 14 minutes
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}
