import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toast-stack">
      <div
        *ngFor="let toast of toastService.toasts(); trackBy: trackById"
        class="toast"
        [class.toast-success]="toast.type === 'success'"
        [class.toast-error]="toast.type === 'error'"
        [class.toast-info]="toast.type === 'info'">
        {{ toast.message }}
      </div>
    </div>
  `
})
export class ToastContainerComponent {
  toastService = inject(ToastService);

  trackById(index: number, toast: { id: string }) {
    return toast.id;
  }
}
