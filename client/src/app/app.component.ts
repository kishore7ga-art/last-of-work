import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './components/shared/toast-container.component';
import { ThemeService } from './services/theme.service';
import { KeepAliveService } from './services/keepalive.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastContainerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <router-outlet></router-outlet>
    <app-toast-container></app-toast-container>
  `,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  private themeService = inject(ThemeService);
  private keepAlive = inject(KeepAliveService);
  title = 'client';

  ngOnInit(): void {
    this.themeService.loadSavedTheme();
    this.keepAlive.start();

    // Catch ALL uncaught errors globally
    window.addEventListener('unhandledrejection', (event) => {
      // Prevent console spam
      event.preventDefault();
      console.warn(
        'Handled error:',
        event.reason?.message || event.reason
      );
    });

    window.addEventListener('error', (event) => {
      console.warn('Global error caught:', event.message);
    });
  }

  ngOnDestroy(): void {
    this.keepAlive.stop();
  }
}
