import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<ToastMessage[]>([]);

  show(message: string, type: ToastType = 'info') {
    const id = Math.random().toString(36).slice(2, 10);
    this.toasts.update(items => [...items, { id, type, message }]);
    window.setTimeout(() => this.dismiss(id), 3000);
  }

  success(message: string) {
    this.show(message, 'success');
  }

  error(message: string) {
    this.show(message, 'error');
  }

  info(message: string) {
    this.show(message, 'info');
  }

  dismiss(id: string) {
    this.toasts.update(items => items.filter(item => item.id !== id));
  }
}
// catchError


