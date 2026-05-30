import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { SavedComponent, CanvasBlock } from '../store/builder.models';
import { getApiBaseUrl } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class ComponentLibraryService {
  private http = inject(HttpClient);
  private _components = signal<SavedComponent[]>([]);
  private apiUrl = `${getApiBaseUrl()}/components`;

  components = computed(() => this._components());

  constructor() {
    this.load();
  }

  load(): void {
    this.http.get<{ success: boolean, components: SavedComponent[] }>(this.apiUrl)
      .pipe(
        catchError(err => {
          console.error('Failed to load components:', err);
          return of({ success: false, components: [] });
        })
      )
      .subscribe({
        next: (res) => {
          if (res.success) {
            this._components.set(res.components);
          }
        }
      });
  }

  save(name: string, block: CanvasBlock, description?: string, category?: string): Observable<any> {
    const data = {
      name: name.trim() || 'Unnamed Component',
      description,
      category,
      blocks: [JSON.parse(JSON.stringify(block))]
    };
    
    return this.http.post<{ success: boolean, component: SavedComponent }>(this.apiUrl, data)
      .pipe(
        tap(res => {
          if (res.success) {
            this._components.update(comps => [res.component, ...comps]);
          }
        }),
        catchError(err => {
          console.error('Failed to save component:', err);
          return of({ success: false, component: null as any });
        })
      );
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => {
          this._components.update(comps => comps.filter(c => (c as any)._id !== id && c.id !== id));
        }),
        catchError(err => {
          console.error('Failed to delete component:', err);
          return of({ success: false });
        })
      );
  }
}
