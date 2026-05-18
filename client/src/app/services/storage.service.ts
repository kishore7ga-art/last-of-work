import { Injectable, inject } from '@angular/core';
import { CanvasBlock } from '../store/builder.models';
import { BuilderStore } from '../store/builder.store';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly CANVAS_KEY = 'builder_canvas';
  private readonly HISTORY_KEY = 'builder_history';
  private store = inject(BuilderStore);

  savePage(blocks: CanvasBlock[]): void {
    try {
      localStorage.setItem(this.CANVAS_KEY, JSON.stringify(blocks));
      console.log('Page saved to localStorage');
    } catch (e) {
      console.error('Failed to save page to localStorage', e);
    }
  }

  loadPage(): CanvasBlock[] | null {
    try {
      const data = localStorage.getItem(this.CANVAS_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load page from localStorage', e);
    }
    return null;
  }

  clearPage(): void {
    localStorage.removeItem(this.CANVAS_KEY);
  }

  saveToHistory(blocks: CanvasBlock[]): void {
    // Already handled in the BuilderStore internally
  }
}
